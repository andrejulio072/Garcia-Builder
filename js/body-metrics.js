// Body Metrics System - Sistema de dados físicos
(() => {
  let currentUser = null;
  // Must be an array; we unshift new entries. Using an object here
  // caused TypeError: bodyMetrics.unshift is not a function when saving.
  // Initialize as empty array to store chronological entries (latest first).
  let bodyMetrics = [];
  let progressPhotos = [];

  const init = () => {
    checkUserAuth();

    // On my-profile page we already have a dedicated Body Metrics tab.
    // Avoid injecting a duplicate section here; just expose modal/upload helpers.
    if (window.location.pathname.includes('my-profile')) {
      initializeBodyMetrics();
    } else {
      // On other pages (e.g., dashboard), we can render a compact section.
      initializeBodyMetrics();
      addBodyMetricsSection();
    }
  };

  const checkUserAuth = async () => {
    try {
      if (window.supabaseClient) {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (!error && user) {
          currentUser = user;
          await loadBodyMetrics();
          // attempt sync of any local entries to cloud
          trySyncLocalMetrics();
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }
  };

  const addBodyMetricsSection = () => {
    const profileContainer = document.querySelector('.profile-container .container');
    if (!profileContainer) return;

    const bodyMetricsHTML = `
      <!-- Body Metrics Section -->
      <div class="profile-card" id="body-metrics-section">
        <h5 class="text-readable mb-4 d-flex align-items-center">
          <i class="fas fa-weight me-2 text-warning"></i>
          Body Metrics & Progress
          <button class="btn btn-outline-primary btn-sm ms-auto" onclick="showMetricsModal()">
            <i class="fas fa-plus me-1"></i>Add Entry
          </button>
        </h5>

        <!-- Current Stats -->
        <div class="row mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-weight"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value" id="current-weight">--</div>
                <div class="stat-label">Current Weight</div>
                <div class="stat-change" id="weight-change">--</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-ruler-vertical"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value" id="current-height">--</div>
                <div class="stat-label">Height</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calculator"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value" id="current-bmi">--</div>
                <div class="stat-label">BMI</div>
                <div class="stat-change" id="bmi-status">--</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value" id="current-bodyfat">--</div>
                <div class="stat-label">Body Fat %</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body Measurements -->
        <div class="row mb-4">
          <div class="col-md-6">
            <h6 class="text-readable mb-3">
              <i class="fas fa-ruler me-2"></i>Body Measurements
            </h6>
            <div class="measurements-grid">
              <div class="measurement-item">
                <span class="measurement-label">Chest:</span>
                <span class="measurement-value" id="chest-measurement">-- cm</span>
              </div>
              <div class="measurement-item">
                <span class="measurement-label">Waist:</span>
                <span class="measurement-value" id="waist-measurement">-- cm</span>
              </div>
              <div class="measurement-item">
                <span class="measurement-label">Hips:</span>
                <span class="measurement-value" id="hips-measurement">-- cm</span>
              </div>
              <div class="measurement-item">
                <span class="measurement-label">Arms:</span>
                <span class="measurement-value" id="arms-measurement">-- cm</span>
              </div>
              <div class="measurement-item">
                <span class="measurement-label">Thighs:</span>
                <span class="measurement-value" id="thighs-measurement">-- cm</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <h6 class="text-readable mb-3">
              <i class="fas fa-chart-line me-2"></i>Progress Chart
            </h6>
            <div class="chart-container">
              <canvas id="weightChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- Progress Photos -->
        <div class="mb-4">
          <h6 class="text-readable mb-3 d-flex align-items-center">
            <i class="fas fa-camera me-2"></i>
            Progress Photos
            <button class="btn btn-outline-secondary btn-sm ms-auto" onclick="uploadProgressPhoto()">
              <i class="fas fa-upload me-1"></i>Upload Photo
            </button>
          </h6>
          <div class="progress-photos-grid" id="progress-photos">
            <!-- Photos will be loaded here -->
          </div>
        </div>

        <!-- Recent Entries -->
        <div class="recent-entries">
          <h6 class="text-readable mb-3">
            <i class="fas fa-history me-2"></i>Recent Entries
          </h6>
          <div id="recent-entries-list">
            <!-- Recent entries will be loaded here -->
          </div>
        </div>
      </div>
    `;

    // Inserir antes da última seção
    const lastCard = profileContainer.lastElementChild;
    lastCard.insertAdjacentHTML('beforebegin', bodyMetricsHTML);

    // Inicializar funcionalidades
    loadCurrentMetrics();
    loadProgressPhotos();
    loadRecentEntries();
    initializeChart();
  };

  const showMetricsModal = () => {
    const modalHTML = `
      <div class="modal fade" id="metricsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content" style="background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(246, 200, 78, 0.3); color: #fff;">
            <div class="modal-header border-0">
              <h5 class="modal-title text-warning">
                <i class="fas fa-plus me-2"></i>Add Body Metrics Entry
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="metricsForm">
                <div class="row">
                  <!-- Weight and Basic Info -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-weight me-1 text-warning"></i>Weight (kg)
                    </label>
                    <input type="number" class="form-control" id="entry-weight" step="0.1" min="30" max="300" placeholder="75.5">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-ruler-vertical me-1 text-warning"></i>Height (cm)
                    </label>
                    <input type="number" class="form-control" id="entry-height" step="0.1" min="100" max="250" placeholder="175">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-percentage me-1 text-warning"></i>Body Fat % (optional)
                    </label>
                    <input type="number" class="form-control" id="entry-bodyfat" step="0.1" min="5" max="50" placeholder="15.5">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-calendar me-1 text-warning"></i>Date
                    </label>
                    <input type="date" class="form-control" id="entry-date" required>
                  </div>
                </div>

                <hr class="my-4">

                <!-- Body Measurements -->
                <h6 class="text-readable mb-3">
                  <i class="fas fa-ruler me-2"></i>Body Measurements (cm)
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Chest</label>
                    <input type="number" class="form-control" id="entry-chest" step="0.1" min="50" max="200" placeholder="95">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Waist</label>
                    <input type="number" class="form-control" id="entry-waist" step="0.1" min="50" max="200" placeholder="85">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Hips</label>
                    <input type="number" class="form-control" id="entry-hips" step="0.1" min="50" max="200" placeholder="95">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Arms</label>
                    <input type="number" class="form-control" id="entry-arms" step="0.1" min="20" max="60" placeholder="35")
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Thighs</label>
                    <input type="number" class="form-control" id="entry-thighs" step="0.1" min="30" max="100" placeholder="55">
                  </div>
                </div>

                <hr class="my-4">

                <!-- Notes -->
                <div class="mb-3">
                  <label class="form-label text-readable">
                    <i class="fas fa-sticky-note me-1 text-warning"></i>Notes (optional)
                  </label>
                  <textarea class="form-control" id="entry-notes" rows="3" placeholder="How are you feeling? Any observations about your progress..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-gradient" id="saveMetrics">
                <i class="fas fa-save me-1"></i>Save Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal existente se houver
    const existingModal = document.getElementById('metricsModal');
    if (existingModal) existingModal.remove();

    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Definir data atual como padrão
    document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];

    // Event listener para salvar
    document.getElementById('saveMetrics').addEventListener('click', saveMetricsEntry);

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('metricsModal'));
    modal.show();
  };

  const saveMetricsEntry = async () => {
    try {
      const saveBtn = document.getElementById('saveMetrics');
      const originalText = saveBtn.innerHTML;

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';

      // Coletar dados
      const entryData = {
        user_id: currentUser?.id,
        date: document.getElementById('entry-date').value,
        weight: parseFloat(document.getElementById('entry-weight').value) || null,
        height: parseFloat(document.getElementById('entry-height').value) || null,
        body_fat: parseFloat(document.getElementById('entry-bodyfat').value) || null,
        measurements: {
          chest: parseFloat(document.getElementById('entry-chest').value) || null,
          waist: parseFloat(document.getElementById('entry-waist').value) || null,
          hips: parseFloat(document.getElementById('entry-hips').value) || null,
          arms: parseFloat(document.getElementById('entry-arms').value) || null,
          thighs: parseFloat(document.getElementById('entry-thighs').value) || null
        },
        notes: document.getElementById('entry-notes').value.trim() || null,
        created_at: new Date().toISOString(),
        client_id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      };

      // Validar pelo menos um campo preenchido
      if (!entryData.weight && !entryData.height && !entryData.body_fat &&
          !Object.values(entryData.measurements).some(v => v !== null)) {
        throw new Error('Please fill at least one measurement field');
      }

      // Salvar dados
      await saveBodyMetrics(entryData);

      // Sucesso
      showNotification('✅ Body metrics saved successfully!', 'success');

      // Notify other parts of the app (e.g., Dashboard) that body metrics were saved
      try {
        window.dispatchEvent(new CustomEvent('gb:bodyMetricsSaved', { detail: entryData }));
      } catch (e) {
        console.warn('Event dispatch failed:', e);
      }

      // Fechar modal
      bootstrap.Modal.getInstance(document.getElementById('metricsModal')).hide();

      // Recarregar dados
      setTimeout(() => {
        loadBodyMetrics();
        loadCurrentMetrics();
        loadRecentEntries();
        updateChart();
      }, 1000);

    } catch (error) {
      console.error('Save metrics error:', error);
      showNotification(`❌ ${error.message}`, 'error');
    } finally {
      const saveBtn = document.getElementById('saveMetrics');
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Entry';
    }
  };

  const loadBodyMetrics = async () => {
    try {
      if (window.supabaseClient && currentUser) {
        const { data, error } = await window.supabaseClient
          .from('body_metrics')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('date', { ascending: false });

        if (!error && data) {
          bodyMetrics = data;
        }
      }

      // Fallback para localStorage
      if (!bodyMetrics.length) {
        const stored = localStorage.getItem(`gb_body_metrics_${currentUser?.id}`);
        bodyMetrics = stored ? JSON.parse(stored) : [];
      }

      console.log(`📊 Loaded ${bodyMetrics.length} body metric entries`);

    } catch (error) {
      console.error('❌ Error loading body metrics:', error);
    }
  };

  const saveBodyMetrics = async (entryData) => {
    try {
      let savedViaSupabase = false;
      if (window.supabaseClient && currentUser) {
        const { error } = await window.supabaseClient
          .from('body_metrics')
          .insert([entryData]);

        if (!error) {
          savedViaSupabase = true;
        } else {
          console.warn('Supabase insert failed for body_metrics, falling back to localStorage:', error?.message || error);
        }
      }

      if (!savedViaSupabase) {
        // Fallback para localStorage (sempre persistimos localmente)
        const key = `gb_body_metrics_${currentUser?.id || 'guest'}`;
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        entryData.id = entryData.id || Date.now().toString();
        stored.push(entryData);
        localStorage.setItem(key, JSON.stringify(stored));
      }

      // Atualizar array local
      bodyMetrics = bodyMetrics || [];
      bodyMetrics.unshift(entryData);

    } catch (error) {
      console.error('❌ Error saving body metrics:', error);
      // Graceful fallback message (avoid blocking the user)
      throw new Error('Failed to save metrics online. Saved locally and will sync later.');
    }
  };

  // Try to sync any locally stored metrics to Supabase when online
  async function trySyncLocalMetrics() {
    try {
      if (!window.supabaseClient || !currentUser) return;
      const key = `gb_body_metrics_${currentUser.id}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (!stored.length) return;

      // Fetch existing client_ids to avoid duplicates
      const { data: cloudRows } = await window.supabaseClient
        .from('body_metrics')
        .select('client_id')
        .eq('user_id', currentUser.id);
      const cloudIds = new Set((cloudRows || []).map(r => r.client_id).filter(Boolean));

      const toPush = stored.filter(row => row.client_id && !cloudIds.has(row.client_id));
      if (!toPush.length) return;

      const { error } = await window.supabaseClient.from('body_metrics').insert(toPush);
      if (!error) {
        // After push, refresh and clear local duplicates
        await loadBodyMetrics();
        const stillLocal = stored.filter(row => row.client_id && !cloudIds.has(row.client_id));
        localStorage.setItem(key, JSON.stringify(stillLocal));
        console.log(`✅ Synced ${toPush.length} local metrics to cloud`);
      }
    } catch (e) {
      console.warn('Metrics sync skipped:', e?.message || e);
    }
  }

  const loadCurrentMetrics = () => {
    if (!bodyMetrics.length) {
      return;
    }

    const latest = bodyMetrics[0];
    const previous = bodyMetrics[1];

    // Weight
    if (latest.weight) {
      document.getElementById('current-weight').textContent = `${latest.weight} kg`;

      if (previous?.weight) {
        const change = latest.weight - previous.weight;
        const changeEl = document.getElementById('weight-change');
        changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
        changeEl.className = change > 0 ? 'stat-change text-warning' : 'stat-change text-success';
      }
    }

    // Height
    if (latest.height) {
      document.getElementById('current-height').textContent = `${latest.height} cm`;
    }

    // BMI
    if (latest.weight && latest.height) {
      const bmi = latest.weight / Math.pow(latest.height / 100, 2);
      document.getElementById('current-bmi').textContent = bmi.toFixed(1);

      let status = 'Normal';
      if (bmi < 18.5) status = 'Underweight';
      else if (bmi >= 25 && bmi < 30) status = 'Overweight';
      else if (bmi >= 30) status = 'Obese';

      document.getElementById('bmi-status').textContent = status;
    }

    // Body Fat
    if (latest.body_fat) {
      document.getElementById('current-bodyfat').textContent = `${latest.body_fat}%`;
    }

    // Measurements
    if (latest.measurements) {
      const measurements = latest.measurements;
      document.getElementById('chest-measurement').textContent = measurements.chest ? `${measurements.chest} cm` : '-- cm';
      document.getElementById('waist-measurement').textContent = measurements.waist ? `${measurements.waist} cm` : '-- cm';
      document.getElementById('hips-measurement').textContent = measurements.hips ? `${measurements.hips} cm` : '-- cm';
      document.getElementById('arms-measurement').textContent = measurements.arms ? `${measurements.arms} cm` : '-- cm';
      document.getElementById('thighs-measurement').textContent = measurements.thighs ? `${measurements.thighs} cm` : '-- cm';
    }
  };

  const loadRecentEntries = () => {
    const entriesList = document.getElementById('recent-entries-list');
    if (!entriesList || !bodyMetrics.length) {
      entriesList.innerHTML = '<div class="text-muted text-center py-3">No entries yet</div>';
      return;
    }

    const recentEntries = bodyMetrics.slice(0, 5).map(entry => {
      const date = new Date(entry.date).toLocaleDateString();
      const metrics = [];

      if (entry.weight) metrics.push(`${entry.weight} kg`);
      if (entry.body_fat) metrics.push(`${entry.body_fat}% BF`);
      if (entry.measurements?.waist) metrics.push(`${entry.measurements.waist} cm waist`);

      return `
        <div class="entry-item">
          <div class="entry-date">${date}</div>
          <div class="entry-metrics">${metrics.join(' • ')}</div>
          ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
        </div>
      `;
    }).join('');

    entriesList.innerHTML = recentEntries;
  };

  const uploadProgressPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = function(event) {
      const files = Array.from(event.target.files);
      files.forEach(async (file) => {
        if (!file.type.startsWith('image/')) return;

        // Try Supabase Storage first to avoid localStorage quota limits
        let photoRecord = null;
        if (window.supabaseClient && currentUser) {
          try {
            const bucket = 'user-assets';
            const path = `${currentUser.id}/progress/${Date.now()}-${file.name}`;
            const { data, error } = await window.supabaseClient.storage
              .from(bucket)
              .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
            if (error) throw error;
            const { data: pub } = window.supabaseClient.storage.from(bucket).getPublicUrl(data.path);
            photoRecord = {
              user_id: currentUser?.id,
              image_url: pub.publicUrl,
              filename: file.name,
              date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString()
            };
          } catch (e) {
            console.warn('Supabase Storage upload failed, compressing and saving locally:', e?.message || e);
          }
        }

        // Fallback: compress to base64 (max ~1280px) and store locally
        if (!photoRecord) {
          const compressedDataUrl = await compressImageToDataURL(file, 1280, 0.8);
          photoRecord = {
            user_id: currentUser?.id,
            image_data: compressedDataUrl,
            filename: file.name,
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          };
        }

        saveProgressPhoto(photoRecord);
      });
    };

    input.click();
  };

  const saveProgressPhoto = async (photoData) => {
    try {
      progressPhotos = progressPhotos || [];
      progressPhotos.unshift(photoData);

      // Salvar metadados no localStorage (armazenamos URL ou base64 comprimida)
      const key = `gb_progress_photos_${currentUser?.id || 'guest'}`;
      localStorage.setItem(key, JSON.stringify(progressPhotos));

      showNotification('📸 Progress photo uploaded!', 'success');
      loadProgressPhotos();

    } catch (error) {
      console.error('Error saving photo:', error);
      showNotification('❌ Failed to upload photo', 'error');
    }
  };

  const loadProgressPhotos = () => {
    const photosGrid = document.getElementById('progress-photos');
    if (!photosGrid) return;

    // Carregar do localStorage
  const stored = localStorage.getItem(`gb_progress_photos_${currentUser?.id || 'guest'}`);
    progressPhotos = stored ? JSON.parse(stored) : [];

    if (!progressPhotos.length) {
      photosGrid.innerHTML = '<div class="text-muted text-center py-3">No progress photos yet</div>';
      return;
    }

    const photosHTML = progressPhotos.slice(0, 12).map((photo, index) => `
      <div class="progress-photo-item">
        <img src="${photo.image_url || photo.image_data}" alt="Progress ${index + 1}" class="progress-photo" onclick="viewPhoto('${photo.image_url || photo.image_data}')">
        <div class="photo-date">${new Date(photo.date).toLocaleDateString()}</div>
      </div>
    `).join('');

    photosGrid.innerHTML = photosHTML;
  };

  const initializeChart = () => {
    // Simple chart implementation (pode ser melhorado com Chart.js)
    const canvas = document.getElementById('weightChart');
    if (!canvas || !bodyMetrics.length) return;

    const ctx = canvas.getContext('2d');
    const chartData = bodyMetrics.slice(0, 10).reverse()
      .filter(entry => entry.weight)
      .map(entry => ({
        date: new Date(entry.date),
        weight: entry.weight
      }));

    if (chartData.length < 2) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data for chart', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Desenhar gráfico simples
    drawSimpleChart(ctx, chartData, canvas.width, canvas.height);
  };

  const drawSimpleChart = (ctx, data, width, height) => {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Configurar estilo
    ctx.strokeStyle = '#F6C84E';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#666';
    ctx.font = '12px Inter';

    // Calcular min/max
    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights) - 1;
    const maxWeight = Math.max(...weights) + 1;

    // Desenhar linha
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (point.weight - minWeight) / (maxWeight - minWeight)) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Pontos
      ctx.fillStyle = '#F6C84E';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();

    // Labels
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText(`${minWeight.toFixed(1)} kg`, padding, height - 5);
    ctx.fillText(`${maxWeight.toFixed(1)} kg`, padding, 15);
  };

  const updateChart = () => {
    setTimeout(() => {
      initializeChart();
    }, 500);
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  // CSS para body metrics
  const addBodyMetricsStyles = () => {
    const styles = `
      <style>
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(246, 200, 78, 0.3);
        }
        .stat-icon {
          font-size: 1.5rem;
          color: #F6C84E;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }
        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0.25rem 0;
        }
        .stat-change {
          font-size: 0.75rem;
          font-weight: 500;
        }
        .measurements-grid {
          display: grid;
          gap: 0.75rem;
        }
        .measurement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .measurement-label {
          color: rgba(255, 255, 255, 0.7);
        }
        .measurement-value {
          color: #fff;
          font-weight: 500;
        }
        .chart-container {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .progress-photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        .progress-photo-item {
          text-align: center;
        }
        .progress-photo {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
          .progress-photo { height: 180px; }
        }
        .progress-photo:hover {
          transform: scale(1.05);
        }
        .photo-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
        }
        .entry-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .entry-date {
          font-weight: 600;
          color: #F6C84E;
          margin-bottom: 0.25rem;
        }
        .entry-metrics {
          color: #fff;
          margin-bottom: 0.25rem;
        }
        .entry-notes {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  };

  const initializeBodyMetrics = () => {
    // Fazer funções disponíveis globalmente
    window.showMetricsModal = showMetricsModal;
    window.uploadProgressPhoto = uploadProgressPhoto;
    window.viewPhoto = (src) => {
      // Implementar visualizador de foto
      const modal = `
        <div class="modal fade" id="photoModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark">
              <div class="modal-body text-center p-0">
                <img src="${src}" class="img-fluid" style="max-height: 80vh;">
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modal);
      const photoModal = new bootstrap.Modal(document.getElementById('photoModal'));
      photoModal.show();
      photoModal._element.addEventListener('hidden.bs.modal', () => {
        document.getElementById('photoModal').remove();
      });
    };
  };

  // Public API
  window.BodyMetrics = {
    init,
    showMetricsModal,
    uploadProgressPhoto,
    loadBodyMetrics
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addBodyMetricsStyles();
      setTimeout(init, 500);
    });
  } else {
    addBodyMetricsStyles();
    setTimeout(init, 500);
  }

  console.log('Body Metrics System loaded');
})();

// Utility: compress image file to DataURL to reduce localStorage usage
async function compressImageToDataURL(file, maxSize = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
