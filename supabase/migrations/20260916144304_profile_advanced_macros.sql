-- Persist the full input and output of the advanced nutrition calculator.

alter table public.user_macros
  add column if not exists maintenance_calories numeric,
  add column if not exists maintenance_low numeric,
  add column if not exists maintenance_high numeric,
  add column if not exists fiber_g numeric,
  add column if not exists water_low_ml numeric,
  add column if not exists water_high_ml numeric,
  add column if not exists calculation_context jsonb not null default '{}'::jsonb,
  add column if not exists calculator_version text,
  add column if not exists calculated_at timestamptz;

alter table public.user_macros
  drop constraint if exists user_macros_calculation_context_object,
  add constraint user_macros_calculation_context_object
    check (jsonb_typeof(calculation_context) = 'object'),
  drop constraint if exists user_macros_advanced_values_nonnegative,
  add constraint user_macros_advanced_values_nonnegative
    check (
      (maintenance_calories is null or maintenance_calories >= 0)
      and (maintenance_low is null or maintenance_low >= 0)
      and (maintenance_high is null or maintenance_high >= 0)
      and (fiber_g is null or fiber_g >= 0)
      and (water_low_ml is null or water_low_ml >= 0)
      and (water_high_ml is null or water_high_ml >= 0)
    );

comment on column public.user_macros.calculation_context is
  'User-owned inputs used to reproduce the saved advanced macro calculation.';
comment on column public.user_macros.calculator_version is
  'Version of the shared Garcia Builder nutrition calculation engine.';
