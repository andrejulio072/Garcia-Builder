/**
 * GARCIA BUILDER - TRAINER MODAL MODULE
 * Version: 1.0 Professional
 * Dynamic modal for trainer program information
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    /**
     * Show Trainer Information Modal
     * Creates and displays modal with program details
     */
    window.showTrainerInfo = function() {
        const modal = createModalElement();
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // Cleanup on close
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    };

    /**
     * Create modal DOM element
     * @returns {HTMLElement} Modal element
     */
    function createModalElement() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: #1a1a1a; color: #fff; border: 1px solid rgba(255,255,255,0.1);">
                    <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h5 class="modal-title text-warning">
                            <i class="fas fa-star me-2"></i>Garcia Builder Trainer Program
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <h6 class="text-warning mb-3">
                                    <i class="fas fa-tools me-2"></i>What You Get
                                </h6>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Advanced client management dashboard</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Session scheduling & tracking tools</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Progress monitoring & analytics</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Automated payment processing</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Marketing materials & support</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Ongoing education & certification</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-warning mb-3">
                                    <i class="fas fa-user-check me-2"></i>Requirements
                                </h6>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><i class="fas fa-certificate text-info me-2"></i>Valid fitness certification (NASM, ACE, ACSM, etc.)</li>
                                    <li class="mb-2"><i class="fas fa-clock text-info me-2"></i>Minimum 2 years training experience</li>
                                    <li class="mb-2"><i class="fas fa-heart text-info me-2"></i>Passion for helping clients achieve results</li>
                                    <li class="mb-2"><i class="fas fa-laptop text-info me-2"></i>Comfortable with digital platforms</li>
                                    <li class="mb-2"><i class="fas fa-comments text-info me-2"></i>Excellent communication skills</li>
                                    <li class="mb-2"><i class="fas fa-handshake text-info me-2"></i>Professional demeanor & reliability</li>
                                </ul>
                            </div>
                            <div class="col-12">
                                <div class="alert" style="background: rgba(246,200,78,0.1); border: 1px solid rgba(246,200,78,0.3); color: #F6C84E;">
                                    <h6><i class="fas fa-rocket me-2"></i>Application Process</h6>
                                    <p class="mb-2">1. Complete our comprehensive trainer application</p>
                                    <p class="mb-2">2. Upload certification documents and portfolio</p>
                                    <p class="mb-2">3. Professional review (24-48 hours)</p>
                                    <p class="mb-0">4. Welcome to the Garcia Builder family!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <a href="become-trainer.html" class="btn btn-warning">
                            <i class="fas fa-paper-plane me-2"></i>Apply Now
                        </a>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

})();
