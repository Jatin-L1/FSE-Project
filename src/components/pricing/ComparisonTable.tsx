"use client";

// Types
type CellValue = boolean | string;

interface CategoryRow {
  category: string;
}

interface FeatureRow {
  feature: string;
  free: CellValue;
  creator: CellValue;
  pro: CellValue;
  team: CellValue;
}

type Row = CategoryRow | FeatureRow;

function isCategory(row: Row): row is CategoryRow {
  return "category" in row;
}

// Table Data
const ROWS: Row[] = [
  { category: "Generation" },
  { feature: "Monthly credits",      free: "5",         creator: "40",        pro: "120",       team: "Custom pool" },
  { feature: "Image ads (1 credit)", free: true,        creator: true,        pro: true,        team: true          },
  { feature: "Video ads (2 credits)",free: false,       creator: true,        pro: true,        team: true          },
  { feature: "Queue speed",          free: "Standard",  creator: "Priority",  pro: "Fastest",   team: "Dedicated"   },

  { category: "Creative Tools" },
  { feature: "Style presets",        free: "6 basic",   creator: "40+ full",  pro: "40+ full",  team: "40+ custom"  },
  { feature: "Aspect ratios",        free: "Square",    creator: "Standard",  pro: "All + custom crop", team: "All + custom crop" },
  { feature: "Product photo uploads",free: false,       creator: "5 / mo",    pro: "Unlimited", team: "Unlimited"   },
  { feature: "Brand kit",            free: false,       creator: false,       pro: true,        team: true          },

  { category: "Storage & Sharing" },
  { feature: "Cloudinary storage",   free: false,       creator: "5 GB",      pro: "25 GB",     team: "100 GB+"     },
  { feature: "Community feed",       free: "Watermarked", creator: true,      pro: true,        team: true          },
  { feature: "Private workspace",    free: false,       creator: false,       pro: true,        team: true          },
  { feature: "Commercial license",   free: false,       creator: false,       pro: true,        team: true          },

  { category: "Account & Billing" },
  { feature: "Seats",                free: "1",         creator: "1",         pro: "1",         team: "Multi-seat"  },
  { feature: "PhonePe / UPI",        free: "—",         creator: true,        pro: true,        team: true          },
  { feature: "Admin dashboard",      free: false,       creator: false,       pro: false,       team: true          },
  { feature: "SSO / SAML",           free: false,       creator: false,       pro: false,       team: "Add-on"      },

  { category: "Support" },
  { feature: "Support",              free: "Community", creator: "Email",     pro: "Email + chat", team: "Slack + dedicated" },
  { feature: "SLA / uptime",         free: false,       creator: false,       pro: "99.9%",     team: "Custom SLA"  },
];

const PLANS = ["Free", "Creator", "Pro", "Team"] as const;
type PlanKey = "free" | "creator" | "pro" | "team";
const PLAN_KEYS: PlanKey[] = ["free", "creator", "pro", "team"];

// Cell Component
function Cell({ value, isPro }: { value: CellValue; isPro: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span aria-label="included">
        <svg className={`w-5 h-5 mx-auto ${isPro ? "text-accent-purple" : "text-accent-gold"}`} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
          <path d="M6 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    ) : (
      <span aria-label="not included">
        <svg className="w-4 h-4 mx-auto text-white/20" viewBox="0 0 16 16" fill="none">
          <path d="M4 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (value === "—") {
    return <span className="text-white/20 text-xs">—</span>;
  }
  return (
    <span className={`text-xs font-medium ${isPro ? "text-accent-purple" : "text-text-muted"}`}>
      {value}
    </span>
  );
}

// Component
export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface-light/30 shadow-lg">
      <table
        role="table"
        aria-label="Feature comparison across all pricing plans"
        className="w-full min-w-[600px] border-collapse"
      >
        {/* Head */}
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-background text-left px-5 py-4
                         text-xs font-semibold text-text-muted border-b border-r border-border w-44"
            >
              Feature
            </th>
            {PLANS.map((plan, i) => (
              <th
                key={plan}
                scope="col"
                className={`px-4 py-4 text-center text-sm font-bold border-b border-border transition-colors
                  ${i === 2
                    ? "text-accent-purple bg-accent-purple/10 border-l border-r border-accent-purple/30"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {plan}
                {i === 2 && (
                  <span className="block text-[10px] font-bold text-accent-purple mt-0.5 tracking-wide">
                    Most Popular
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {ROWS.map((row, idx) => {
            if (isCategory(row)) {
              return (
                <tr key={`cat-${idx}`}>
                  <td
                    colSpan={5}
                    className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25"
                  >
                    {row.category}
                  </td>
                </tr>
              );
            }

            const feat = row as FeatureRow;
            return (
              <tr
                key={feat.feature}
                className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors"
              >
                {/* Feature label — sticky */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-background px-5 py-3
                             text-left text-xs font-medium text-text-secondary border-r border-border"
                >
                  {feat.feature}
                </th>

                {/* Plan cells */}
                {PLAN_KEYS.map((key, ci) => (
                  <td
                    key={key}
                    className={`px-4 py-3 text-center
                      ${ci === 2
                        ? "bg-accent-purple/[0.08] border-l border-r border-accent-purple/20"
                        : ""
                      }`}
                  >
                    <Cell value={feat[key]} isPro={ci === 2} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
