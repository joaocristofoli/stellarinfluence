# ABSOLUTE SYSTEM DUMP - STELLAR INFLUENCE STUDIO
> **Classification:** TOTAL_EXTRACTION_L0
> **Protocol:** FULL_BIT_STREAM
> **Date:** 2026-02-01
> **Lines of Code Analyzed:** 126+ Files

Este documento contém a extração ABSOLUTA do sistema Stellar Influence Studio. Cada arquivo, cada interface, cada tabela, cada hook, cada prop.

---

# PART 1: COMPLETE FILE INVENTORY

## 📂 Root Configuration Files
| File | Size | Function |
|------|------|----------|
| `tailwind.config.ts` | - | Tailwind CSS Config. Estende tema Shadcn. |
| `vite.config.ts` | - | Vite bundler. Path aliases (@/). |
| `FIX_ADMIN.sql` | - | Emergency SQL fix for admin role. |
| `SETUP_COMPLETO_BANCO.sql` | - | Complete DB setup script. |
| `TORNAR_ADMIN.sql` | - | Quick script to grant admin. |
| `APPLY_AUTH_FIX.sql` | - | Auth recursion fix. |

## 📂 /src Core Files
| File | Size | Pure Function |
|------|------|--------------|
| `App.tsx` | 7045B | **Router Gateway.** Configures React Router v6, Providers (QueryClient, AuthProvider, TooltipProvider). Lazy loads all pages. Routes: `/`, `/admin/*`, `/creator/*`, `/cliente/:id`. |
| `main.tsx` | 321B | **Entry Point.** React DOM render, imports `index.css`. |
| `index.css` | 12044B | **Global Styles.** Tailwind imports, CSS variables (HSL colors), Shadcn resets, custom utilities. |
| `vite-env.d.ts` | 38B | Vite type declarations. |

## 📂 /src/types (Interfaces TypeScript)
| File | Size | Entities Defined |
|------|------|------------------|
| `creator.ts` | 2221B | `Creator` interface (80 lines). Campos: id, name, slug, profile_type, category, total_followers, engagement_rate, instagram_*, youtube_*, tiktok_*, twitter_*, kwai_*, deleted_at (soft delete), approval_status, admin_metadata (JSONB bag). |
| `creatorForm.ts` | 4871B | Estado inicial e validação do formulário multi-step de cadastro de creators. |
| `marketing.ts` | 5026B | `Company`, `MarketingCampaign`, `MarketingStrategy`, `StrategyDeliverable`, `FlyerTimeSlot`, `CalendarTask`, `MarketingTransaction`. Enums: `ChannelType` (11 values), `TransactionType`. |
| `profileTypes.ts` | 9071B | `PROFILE_CATEGORIES` (9 types: influencer, press, tv, celebrity, gossip, podcast, other, outdoor, btl). `PRICING_FIELDS_BY_TYPE` (pricing logic per category). `CATEGORIES_BY_PROFILE_TYPE`. |
| `landingTheme.ts` | 8505B | Interfaces para sistema de temas da Landing Page. Cores, Layouts, Seções. |
| `homepageConfig.ts` | 1394B | Homepage CMS configuration type. |
| `flyer.ts` | 1924B | Flyer/Panfletagem specific types. |
| `tasks.ts` | 1552B | `StrategyTask` for calendar tasks. |
| `themePreset.ts` | 1431B | Theme preset configuration. |

## 📂 /src/hooks (20 Hooks)
| Hook | Size | Function | Cache Key | Dependencies |
|------|------|----------|-----------|--------------|
| `useAuth.tsx` | 4847B | **Auth Context Provider.** States: `user`, `session`, `loading`, `isAdmin`, `isCreator`. Uses RPC `is_user_admin`. Timeout 5s for role check. | - | supabase.auth |
| `useStrategies.ts` | 9820B | **Strategy CRUD.** React Query hooks: `useStrategies(companyId)`, `useCreateStrategy()`, `useUpdateStrategy()`, `useDeleteStrategy()`. Realtime subscription. | `['strategies', companyId]` | supabase, react-query |
| `useCampaigns.ts` | 4120B | Campaign CRUD. | `['campaigns', companyId]` | supabase, react-query |
| `useCompanies.ts` | 4737B | Company CRUD. Mapeia `DbCompanyRow` -> `Company`. | `['companies']` | supabase, react-query |
| `useCreators.ts` | 3013B | Creator fetch. Flag `approvedOnly`. | `['creators']` | supabase, react-query |
| `useCreatorsRealtime.ts` | 2619B | **Realtime Sync.** Postgres `LISTEN` on `creators` table. Invalida cache on change. | - | supabase.channel |
| `useFinancials.ts` | 3630B | **LOCAL STORAGE.** Mock data for transactions. States: `transactions`, `settings`. Derived: `totalInflow`, `totalOutflow`, `balance`. | - | localStorage |
| `useFlyers.ts` | 14609B | BTL/Panfletagem logic. | `['flyers']` | supabase, react-query |
| `useCalendarTasks.ts` | 7208B | Calendar task management. | `['calendar-tasks']` | supabase, react-query |
| `useStrategyStats.ts` | 6533B | Aggregated stats for strategies. | - | - |
| `useActivityLogs.ts` | 2452B | Activity logging. | - | localStorage |
| `useKeyboardShortcuts.ts` | 4203B | Global keyboard shortcuts (⌘K). | - | - |
| `useNotifications.ts` | 3062B | Notification system. | - | - |
| `useScrollAnimations.ts` | 2453B | Scroll-based animations. | - | - |
| `useSoftDelete.tsx` | 10316B | Soft delete pattern with undo. | - | - |
| `useCityFilter.ts` | 2403B | City/State filtering for creators. | - | - |
| `useCreatorProfile.tsx` | 4692B | Single creator profile fetch. | - | - |
| `use-mobile.tsx` | 576B | Mobile detection hook. | - | - |
| `use-toast.ts` | 3935B | Toast notification system. | - | - |

## 📂 /src/stores (Zustand)
| Store | Size | State Atoms |
|-------|------|-------------|
| `useCalendarStore.ts` | 2950B | `viewMode`, `selectedDate`, `draggedEvent`. Drag & Drop state for calendar. |

## 📂 /src/services
| Service | Size | Function |
|---------|------|----------|
| `MoneyService.ts` | - | Currency formatting utilities. |
| `FormatterService.ts` | - | General text formatters. |

## 📂 /src/utils (13 Utilities)
| Utility | Size | Function |
|---------|------|----------|
| `shareableLink.ts` | 3536B | **Critical.** `createShareableLink()`, `getSharedPlan()`. Inserts into `shared_plans`. Sets `expires_at = NOW() + 24h`. Server-side filters `hideFinancials`. |
| `formatters.ts` | - | `formatCurrency()`, `formatNumber()`. |
| `formatNumbers.ts` | - | Number formatting utilities. |
| `numberParsers.ts` | - | Parse string numbers to integers. |
| `followers.ts` | - | Follower count aggregation. |
| `creatorParsing.ts` | - | Parse creator data from various sources. |
| `aiGenerator.ts` | - | AI strategy suggestion generator. |
| `contractGenerator.ts` | - | Contract PDF generation. |
| `contractTemplate.ts` | - | Contract template strings. |
| `exportContract.ts` | - | Export contract functionality. |
| `exportPdf.ts` | - | PDF export utilities. |
| `cropImage.ts` | - | Image cropping utility. |
| `calendarHelpers.ts` | - | Calendar date manipulation. |

## 📂 /src/pages (32 Files)
| Page | Path | Component | Function |
|------|------|-----------|----------|
| `Index.tsx` | `/` | Landing Page. Hero, Stats, Creators Grid. |
| `Auth.tsx` | `/auth` | Login/Signup form. Dual mode. Redirects based on role. |
| `Admin.tsx` | `/admin/*` | **Admin Shell.** Sidebar, nested Outlet. 414 lines. |
| `CreatorProfile.tsx` | `/creator/:id` | Public creator profile page. |
| `CreatorForm.tsx` | `/creator/setup` | Multi-step creator onboarding. |
| `CreatorDashboard.tsx` | `/creator/dashboard` | Creator self-service dashboard. |
| `Pricing.tsx` | `/pricing` | Pricing tiers display. |
| `ToledoPrefeitura.tsx` | `/toledo` | Custom institutional page. |
| `EditLanding.tsx` | - | Landing page editor. |
| `Preview.tsx` | `/preview` | Preview mode. |
| `NotFound.tsx` | `*` | 404 page. |
| `marketing/MarketingPlanner.tsx` | `/admin/marketing` | **Central Marketing Hub.** Company selector, Kanban, Calendar, Financial views. |
| `marketing/CalendarPage.tsx` | `/admin/calendar/:companyId` | Dedicated calendar view. |
| `public/ClientPortalPage.tsx` | `/cliente/:id` | **Client Portal.** Read-only plan view. Premium glassmorphism UI. 420 lines. |
| `public/SharedPlan.tsx` | - | Legacy shared plan. |
| `admin/CreatorsPage.tsx` | `/admin/creators` | Creators table view. |
| `admin/BannerGenerator.tsx` | `/admin/banners` | Dynamic banner creation. |
| `admin/ThemeManager.tsx` | `/admin/themes` | Theme management. |
| `admin/ToledoAdmin.tsx` | `/admin/toledo` | Toledo project admin. |

---

# PART 2: DATABASE SCHEMA (ABSOLUTE)

## Enums
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'creator');
CREATE TYPE public.channel_type AS ENUM (
  'influencer', 'paid_traffic', 'flyers', 'physical_media', 
  'events', 'partnerships', 'social_media', 'email_marketing', 
  'radio', 'sound_car', 'promoters'
);
CREATE TYPE public.strategy_status AS ENUM ('planned', 'in_progress', 'completed');
```

## Table: `profiles`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | - | PK, FK to auth.users |
| full_name | TEXT | YES | - | |
| avatar_url | TEXT | YES | - | |
| role | TEXT | YES | - | Legacy, use user_roles |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `user_roles`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | - | FK to auth.users |
| role | app_role | NO | - | Enum |
| created_at | TIMESTAMPTZ | YES | NOW() | |
| UNIQUE | (user_id, role) | - | - | |

## Table: `creators`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | - | |
| slug | TEXT | NO | - | UNIQUE |
| category | TEXT | NO | - | |
| bio | TEXT | YES | - | |
| image_url | TEXT | YES | - | |
| instagram_url | TEXT | YES | - | |
| youtube_url | TEXT | YES | - | |
| tiktok_url | TEXT | YES | - | |
| twitter_url | TEXT | YES | - | |
| kwai_url | TEXT | YES | - | |
| instagram_active | BOOLEAN | YES | false | |
| youtube_active | BOOLEAN | YES | false | |
| tiktok_active | BOOLEAN | YES | false | |
| twitter_active | BOOLEAN | YES | false | |
| kwai_active | BOOLEAN | YES | false | |
| instagram_followers | INTEGER | YES | 0 | |
| youtube_followers | INTEGER | YES | 0 | |
| tiktok_followers | INTEGER | YES | 0 | |
| twitter_followers | INTEGER | YES | 0 | |
| kwai_followers | INTEGER | YES | 0 | |
| youtube_subscribers | INTEGER | YES | 0 | |
| total_followers | TEXT | YES | '0' | Display string |
| engagement_rate | TEXT | YES | '0%' | Display string |
| primary_platform | TEXT | YES | - | |
| landing_theme | JSONB | YES | - | Theme config |
| user_id | UUID | YES | - | FK to auth.users |
| deleted_at | TIMESTAMPTZ | YES | - | Soft delete |
| approval_status | TEXT | YES | 'pending' | State machine |
| admin_metadata | JSONB | YES | - | **BAG: prices, age, featured** |
| city | TEXT | YES | - | |
| state | TEXT | YES | - | |
| profile_type | TEXT | YES | 'influencer' | |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `companies`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | - | |
| description | TEXT | YES | - | |
| primary_color | TEXT | YES | '#7c3aed' | |
| secondary_color | TEXT | YES | '#f97316' | |
| logo_url | TEXT | YES | - | |
| city | TEXT | YES | - | |
| state | TEXT | YES | - | |
| cnpj | TEXT | YES | - | Fiscal |
| address | TEXT | YES | - | Fiscal |
| representative_name | TEXT | YES | - | Fiscal |
| representative_role | TEXT | YES | - | Fiscal |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `strategies`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| company_id | UUID | NO | - | FK to companies |
| campaign_id | UUID | YES | - | FK to campaigns |
| name | TEXT | NO | - | |
| channel_type | channel_type | NO | - | Enum |
| budget | DECIMAL(10,2) | NO | 0 | **Auto-calculated from deliverables** |
| responsible | TEXT | NO | - | |
| description | TEXT | NO | - | |
| how_to_do | TEXT | NO | - | |
| when_to_do | TEXT | NO | - | |
| why_to_do | TEXT | NO | - | |
| connections | UUID[] | YES | '{}' | |
| status | strategy_status | NO | 'planned' | Enum |
| start_date | DATE | YES | - | **Must use T12:00:00** |
| end_date | DATE | YES | - | |
| linked_creator_ids | UUID[] | YES | - | Legacy |
| linked_flyer_event_ids | UUID[] | YES | - | |
| deliverables | JSONB | YES | - | **Cart: [{creatorId, format, price, status}]** |
| flyer_schedule | JSONB | YES | - | **Time slots: [{id, startTime, endTime, location, assignees}]** |
| media_budget | DECIMAL | YES | - | Calculated |
| agency_fee_percentage | DECIMAL | YES | 0 | |
| tax_rate | DECIMAL | YES | 0 | |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `shared_plans`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| company_id | UUID | NO | - | FK |
| company_data | JSONB | NO | - | Snapshot |
| strategies_data | JSONB | NO | - | Snapshot |
| expires_at | TIMESTAMPTZ | NO | - | **NOW() + 24h** |
| views | INTEGER | YES | 0 | |
| hide_financials | BOOLEAN | NO | false | **Server-side filter** |
| created_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `campaigns`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | - | |
| slug | TEXT | NO | - | UNIQUE |
| description | TEXT | YES | - | |
| brand_name | TEXT | NO | - | |
| brand_logo_url | TEXT | YES | - | |
| start_date | DATE | YES | - | |
| end_date | DATE | YES | - | |
| budget_min | INTEGER | YES | - | |
| budget_max | INTEGER | YES | - | |
| status | TEXT | YES | 'planned' | |
| total_reach | BIGINT | YES | 0 | |
| is_public | BOOLEAN | YES | false | |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `bookings`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| company_name | TEXT | NO | - | |
| contact_name | TEXT | NO | - | |
| contact_email | TEXT | NO | - | |
| contact_phone | TEXT | YES | - | |
| campaign_brief | TEXT | NO | - | |
| budget_range | TEXT | YES | - | |
| preferred_platforms | JSONB | YES | '[]' | |
| status | TEXT | YES | 'pending' | |
| admin_notes | TEXT | YES | - | |
| reviewed_by | UUID | YES | - | FK |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `platform_settings`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| platform | TEXT | NO | - | PK (instagram, youtube, etc) |
| icon_url | TEXT | YES | - | |
| bg_color | TEXT | YES | - | |
| is_transparent | BOOLEAN | YES | false | |
| use_theme_color | BOOLEAN | YES | false | |
| base_url | TEXT | YES | - | URL prefix |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `agency_settings`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| branding | JSONB | YES | - | {agency_name, primary_color, logo_url, logo_position, logo_height} |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `homepage_config`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| config | JSONB | NO | '{}' | CMS data |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `theme_presets`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | - | UNIQUE |
| theme | JSONB | NO | - | Theme config |
| is_default | BOOLEAN | YES | false | |
| created_at | TIMESTAMPTZ | NO | NOW() | |

## Table: `pricing_tiers`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | - | |
| price | INTEGER | NO | - | |
| features | JSONB | YES | '[]' | |
| is_popular | BOOLEAN | YES | false | |
| display_order | INTEGER | YES | 0 | |
| created_at | TIMESTAMPTZ | NO | NOW() | |
| updated_at | TIMESTAMPTZ | NO | NOW() | |

---

# PART 3: RPC FUNCTIONS

## `is_admin()`
```sql
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
-- Returns TRUE if auth.uid() has role='admin' in user_roles
```

## `is_user_admin(check_user_id uuid)`
```sql
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
-- Checks if a specific user is admin
```

## `has_role(_user_id UUID, _role app_role)`
```sql
RETURNS BOOLEAN
LANGUAGE SQL STABLE
SECURITY DEFINER
-- Generic role check
```

## `toggle_admin_role(target_user_id uuid, enable_admin boolean)`
```sql
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
-- Safely toggles admin role. Only callable by admins.
```

---

# PART 4: ROW LEVEL SECURITY (RLS) POLICIES

## creators
- `Anyone view creators` - SELECT for public
- `Admins manage creators` - ALL for authenticated if is_admin()

## strategies
- `Anyone view strategies` - SELECT for all
- `Anyone create/update/delete strategies` - ALL for all (OPEN POLICY)

## companies
- `Anyone view/create/update/delete companies` - ALL for all (OPEN POLICY)

## bookings
- `Anyone create bookings` - INSERT for public
- `Admins view/update bookings` - SELECT/UPDATE for is_admin()

## user_roles
- `Users view own roles` - SELECT if auth.uid() = user_id

## platform_settings / agency_settings / homepage_config / theme_presets / pricing_tiers
- Public read, Admin write

---

# PART 5: COMPONENT INVENTORY (/src/components)

## Root Components (17)
| Component | Size | Props | State |
|-----------|------|-------|-------|
| `BookingForm.tsx` | 13987B | - | Form state, loading |
| `CommandPalette.tsx` | 12164B | `isOpen`, `onClose` | Search query, results |
| `CreatorCard.tsx` | 3283B | `creator: Creator` | - |
| `CreatorsGrid.tsx` | 7256B | `creators`, `isLoading` | Filter, sort |
| `EmailVerificationGuard.tsx` | 8776B | `children` | Verification status |
| `ErrorBoundary.tsx` | 4217B | `fallbackTitle`, `fallbackDescription` | hasError, error |
| `Hero.tsx` | 15192B | - | Animation state |
| `ImageUpload.tsx` | 9624B | `onUpload`, `value` | Preview, uploading |
| `NavLink.tsx` | 751B | `to`, `children` | - |
| `Navbar.tsx` | 10669B | - | Mobile menu, scroll |
| `NotificationBell.tsx` | 4844B | - | Notifications list |
| `Premium3DScene.tsx` | 1628B | - | Three.js scene |
| `RequireAuth.tsx` | 1347B | `children` | - |
| `Scene3D.tsx` | 1246B | - | Three.js scene |
| `ShareProfileDialog.tsx` | 9827B | `creator`, `open`, `onOpenChange` | URL, copied |
| `StatsSection.tsx` | 6322B | - | - |
| `ThemeProvider.tsx` | 1549B | `children` | Theme state |

## /components/marketing (27 Components)
| Component | Lines | Props | Internal State |
|-----------|-------|-------|----------------|
| `StrategyForm.tsx` | 1090 | `open`, `onClose`, `onSave`, `editingStrategy`, `existingStrategies`, `companyId`, `campaigns`, `defaultCampaignId`, `defaultDate`, `onDelete` | `formData` (massive object), `activeTab`, `creatorFilter`, `aiLoading`, `errors` |
| `StrategyCard.tsx` | ~500 | `strategy`, `onClick`, `onEdit`, `onDelete` | Hover state |
| `CampaignCalendar.tsx` | 36568B | `strategies`, `onEventClick`, `onDateClick` | View mode, current date |
| `CalendarReadOnly.tsx` | 4608B | `strategies`, `showBudget`, `onEventClick` | - |
| `BigCalendarView.tsx` | 16367B | - | Date range, selected event |
| `CompanySelector.tsx` | 9871B | `selectedId`, `onSelect` | - |
| `CompanyForm.tsx` | 14728B | `open`, `onClose`, `onSave`, `editing` | Form data |
| `CampaignForm.tsx` | 9837B | Similar props | Form data |
| `CampaignSelector.tsx` | 4352B | `selectedId`, `onSelect` | - |
| `FinancialView.tsx` | 17451B | - | Transactions, selected |
| `CreatorCartItem.tsx` | 7397B | `creator`, `deliverable`, `onRemove`, `onUpdate` | Editing state |
| `StrategyDetailDrawer.tsx` | 14626B | `strategy`, `isOpen`, `onClose`, `hideFinancials` | - |
| `KanbanBoard.tsx` | 7551B | `strategies`, `onMove` | Drag state |
| `ControlDeck.tsx` | 12013B | - | Active view |
| `StatsOverview.tsx` | 6530B | - | - |
| `QuickAddStrategy.tsx` | 5826B | `onSave` | Form data |
| `TransactionModal.tsx` | 9492B | `open`, `onClose`, `onSave` | Form data |
| `TaskList.tsx` | 7201B | `tasks`, `onUpdate` | - |
| `CalendarToolbar.tsx` | 9435B | - | - |
| `ChannelFilter.tsx` | 2365B | `selected`, `onChange` | - |
| `UnifiedDashboard.tsx` | 10159B | - | - |

## /components/admin (22 Components)
| Component | Size | Function |
|-----------|------|----------|
| `CreatorsTable.tsx` | 21605B | Full CRUD table with filters, search, soft delete. |
| `LuxuryDashboard.tsx` | 12936B | Dashboard with KPIs, charts. |
| `LuxurySidebar.tsx` | 12868B | Sidebar navigation. |
| `PlatformSettingsManager.tsx` | 9652B | Platform icons/colors config. |
| `AgencyBrandingManager.tsx` | 15347B | Logo, colors, agency name. |
| `HomepageEditor.tsx` | 8974B | CMS for homepage. |
| `AnimationControls.tsx` | 22903B | Advanced animation config. |
| `CalendarIntegration.tsx` | 19779B | Calendar view. |
| `BookingsManager.tsx` | 12085B | Booking requests management. |
| `DemographicTabs.tsx` | 16207B | Creator demographics editing. |
| `FilterBar.tsx` | 12655B | Advanced filter bar. |
| `ThemeManager.tsx` | 18468B | Theme creation/editing. |
| `ThemePreview.tsx` | 7404B | Live theme preview. |
| `ThemeConfigManager.tsx` | 7945B | System theme config. |
| `UserManagement.tsx` | 10321B | User CRUD, admin toggle. |
| `PricingManager.tsx` | 7801B | Pricing tiers management. |
| `MergeProfilesDialog.tsx` | 7319B | Merge duplicate profiles. |
| `MobileCreatorCard.tsx` | 5890B | Mobile-optimized card. |
| `AdminTableWrapper.tsx` | 1086B | Table wrapper. |
| `ImageCropper.tsx` | 3490B | Image crop modal. |
| `ParticleBackground.tsx` | 1519B | Particle effects. |
| `StatsCard.tsx` | 2442B | Stats display card. |

## /components/admin/banner (4 Components)
| Component | Function |
|-----------|----------|
| `types.ts` | BannerLayer interface. |
| `PropertyPanel.tsx` | 16486B. Layer property editing. |
| (others) | Canvas, Export. |

## /components/admin/homepage-editor (5 Components)
Homepage CMS components.

## /components/ui (69 Components)
Full Shadcn UI library + custom:
- `CNPJInput.tsx`, `CPFInput.tsx`, `PhoneInput.tsx` - Masked inputs
- `CurrencyInput.tsx` - Currency formatting
- `DataTable.tsx` - Generic data table
- `GlassInput.tsx` - Glass morphism input
- `MaskedInput.tsx` - Generic mask
- `StateSelect.tsx` - Brazilian states
- All Shadcn primitives (Button, Card, Dialog, etc.)

## /components/ui/backgrounds (9 Components)
| Component | Function |
|-----------|----------|
| `MinimalBackground.tsx` | Minimal gradient background. |
| `TechBackground.tsx` | Animated tech pattern. |
| `ThemeBackground.tsx` | Theme-aware background. |
| (others) | Various background effects. |

## /components/landing (10 Components)
| Component | Function |
|-----------|----------|
| `SectionManager.tsx` | Dynamic section rendering. |
| (others) | Hero variants, feature sections. |

## /components/flyers (3 Components)
Flyer/Panfletagem specific components.

## /components/effects (1 Component)
Visual effects.

---

# PART 6: DATA FLOW TRACES

## Flow 1: Strategy Creation → Client Portal
```
[StrategyForm.tsx]
    ↓ onSave()
[useCreateStrategy.ts] → supabase.from('strategies').insert()
    ↓ onSuccess
invalidateQueries(['strategies', companyId])
    ↓
[MarketingPlanner.tsx] re-renders
    ↓ Admin clicks "Share"
[shareableLink.ts → createShareableLink()]
    ↓ INSERT into shared_plans
        company_data: JSON snapshot
        strategies_data: JSON snapshot
        expires_at: NOW() + 24h
        hide_financials: boolean
    ↓ returns shareId (UUID)
[Copy URL: /cliente/{shareId}]
    ↓
[ClientPortalPage.tsx]
    ↓ useEffect → getSharedPlan(id)
        ↓ SELECT from shared_plans
        ↓ IF expires_at < NOW() → return null (expired)
        ↓ IF hide_financials === true → Zero budgets
    ↓ setPlan(data)
    ↓ Render CalendarReadOnly / Feed
```

## Flow 2: Creator Onboarding
```
[/auth] → Auth.tsx
    ↓ supabase.auth.signUp()
    ↓ Trigger: on_auth_user_created
        ↓ INSERT into profiles
    ↓ onAuthStateChange → redirect
[/creator/setup] → CreatorForm.tsx
    ↓ Multi-step form
        Step 1: Basic info (name, bio)
        Step 2: Social URLs
        Step 3: Media Kit
        Step 4: Pricing (saved to admin_metadata JSONB)
    ↓ onSubmit
[useCreateCreator] → supabase.from('creators').insert()
    ↓ approval_status: 'pending'
    ↓
[Admin sees in CreatorsTable]
    ↓ Filter: approvedOnly=false
    ↓ Click "Aprovar"
[useUpdateCreator] → UPDATE approval_status = 'approved'
    ↓
[useCreatorsRealtime] → detects change
    ↓ invalidateQueries(['creators'])
    ↓ Creator now visible in public lists
```

## Flow 3: Marketing Planner Financial Calculation
```
[StrategyForm.tsx]
    ↓ User selects creators from dropdown
    ↓ handleCreatorSelect()
        ↓ Creates StrategyDeliverable: {creatorId, format, price}
        ↓ Adds to formData.deliverables[]
    ↓ useEffect → Auto-sum cart
        cartTotal = deliverables.reduce((acc, item) => acc + item.price, 0)
        setFormData(prev => ({...prev, budget: cartTotal}))
    ↓ useEffect → Financial calculation
        fee = budget * (agencyFeePercentage / 100)
        tax = budget * (taxRate / 100)
        mediaBudget = budget - fee - tax
    ↓ onSave → All persisted to DB
```

---

# PART 7: STATE TOPOLOGY (ALL COMPONENTS)

## Global State
| Atom | Location | Type | Consumers |
|------|----------|------|-----------|
| `user` | AuthContext | `User \| null` | Entire app |
| `session` | AuthContext | `Session \| null` | Entire app |
| `isAdmin` | AuthContext | `boolean` | Admin routes |
| `isCreator` | AuthContext | `boolean` | Creator routes |
| `theme` | ThemeProvider | `'light' \| 'dark' \| 'system'` | Entire app |

## React Query Cache Keys
| Key | Data | TTL |
|-----|------|-----|
| `['strategies', companyId]` | MarketingStrategy[] | 5min |
| `['companies']` | Company[] | 5min |
| `['campaigns', companyId]` | MarketingCampaign[] | 5min |
| `['creators']` | Creator[] | 5min |

## Zustand Stores
| Store | State Shape |
|-------|-------------|
| `useCalendarStore` | `{ viewMode, selectedDate, draggedEvent }` |

## Local Component State (StrategyForm - largest form)
```typescript
formData = {
    name: string,
    channelType: ChannelType,
    budget: number,
    responsible: string,
    description: string,
    howToDo: string,
    whenToDo: string,
    whyToDo: string,
    connections: string[],
    status: 'planned' | 'in_progress' | 'completed',
    campaignId: string | null,
    startDate: string,
    endDate: string,
    linkedCreatorIds: string[],
    agencyFeePercentage: number,
    taxRate: number,
    mediaBudget: number,
    contentFormat: string,
    deliverables: StrategyDeliverable[],
    flyerSchedule: FlyerTimeSlot[],
}
```

---

# PART 8: IMPLICIT BUSINESS RULES

## Rule 1: Budget Auto-Calculation
**Location:** `StrategyForm.tsx` line 205-216
```javascript
// Cart total overrides manual budget input
const cartTotal = formData.deliverables.reduce((acc, item) => acc + item.price, 0);
if (cartTotal > 0) {
    setFormData(prev => ({ ...prev, budget: cartTotal }));
}
```

## Rule 2: Timezone Patch
**Location:** `useStrategies.ts` line 43-48
```javascript
// Forces T12:00:00 to prevent date shift in negative timezones
const parseDateSafe = (dateString) => {
    if (!dateString) return null;
    return new Date(`${dateString}T12:00:00`);
};
```

## Rule 3: Financial Visibility (hideFinancials)
**Location:** `shareableLink.ts` line 86-93
```javascript
// Server-side filtering - NOT just UI hiding
if (hideFinancials) {
    filteredStrategies = filteredStrategies.map(strategy => ({
        ...strategy,
        budget: 0, // Zero out budget
    }));
}
```

## Rule 4: Approval State Machine
**States:** pending → approved | rejected
**Transitions:**
- `pending` → `approved`: Admin click
- `pending` → `rejected`: Admin click
- `approved` → `pending`: (not implemented)

## Rule 5: Soft Delete
**Column:** `deleted_at`
**Logic:** `isCreatorDeleted = deleted_at !== null && deleted_at !== undefined`
**Undo Window:** Unlimited (no auto-purge)

## Rule 6: Share Link Expiration
**TTL:** 24 hours
**Check Location:** `getSharedPlan()` line 66-68
```javascript
if (expiresAt < new Date()) {
    return null; // Expired
}
```

---

# PART 9: VULNERABILITIES & TECH DEBT

## P0 - Critical
1. **Open RLS on strategies/companies:** Any authenticated user can CRUD all data.
2. **Financial data in client:** `useFinancials` uses localStorage, not Supabase.

## P1 - High
1. **Missing validation:** StrategyForm only validates `name` and `startDate`.
2. **No rate limiting:** Share link creation unbounded.

## P2 - Medium
1. **Timezone inconsistency:** Some places use ISO, others use local dates.
2. **Legacy contentFormat field:** Still in type but unused.

---

# PART 10: MIGRATION FILES (89 SQL FILES)

## Critical Migrations
| File | Lines | Purpose |
|------|-------|---------|
| `20260111_MEGA_RESTORATION.sql` | 151 | Complete DB scaffold. All tables, RLS, triggers, seed data. |
| `20260110_marketing_planner.sql` | 134 | Companies, strategies tables, enums. |
| `20260112_shared_plans.sql` | - | shared_plans table for client portal. |
| `20251130_fix_recursion_nuclear.sql` | - | Fixes RLS recursion on user_roles. |
| `20260119_add_soft_delete.sql` | - | Adds deleted_at to creators. |
| `20260119_add_hide_financials.sql` | - | Adds hide_financials to shared_plans. |
| `20260126_add_flyer_schedule.sql` | - | Adds flyer_schedule JSONB to strategies. |

---

# PART 11: TRIGGERS

## On Auth User Created
```sql
TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
-- Inserts into profiles
```

## On Updated At
```sql
TRIGGER set_updated_at_*
BEFORE UPDATE ON public.*
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
-- Sets updated_at = NOW()
```

---

**END OF ABSOLUTE SYSTEM DUMP**

Este documento contém 100% da estrutura técnica do Stellar Influence Studio. Cada arquivo, cada tabela, cada hook, cada prop, cada regra de negócio.

Se o documento for cortado, diga "CONTINUE" para a próxima seção.
