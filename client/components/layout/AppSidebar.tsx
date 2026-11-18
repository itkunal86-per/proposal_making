import { Link } from "react-router-dom";
import {
  // BookOpen,
  Box,
  BriefcaseBusiness,
  Building,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  Folder,
  Gift,
  House,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  // LifeBuoy,
  LogOut,
  Palette,
  Presentation,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth as useSsoSession } from "@/auth/AuthContext";
import {
  ACCOUNT_SETTINGS_URL,
  isSidebarItemActive,
  type SidebarIconName,
  type SidebarMenuModel,
  type SidebarNavItem,
} from "@/lib/sidebarNav";
import "@/styles/app-sidebar.css";

const ICONS: Record<SidebarIconName, LucideIcon> = {
  home: House,
  inbox: Inbox,
  calendar: Calendar,
  library: Folder,
  reports: FileText,
  proposals: Presentation,
  templates: LayoutTemplate,
  deals: BriefcaseBusiness,
  contacts: Users,
  companies: Building,
  dashboard: LayoutDashboard,
  users: Users,
  packages: Box,
  clients: Users,
  ppt: Palette,
};

function uniqueHsl(value: string) {
  const hash = Array.from(value).reduce((total, char) => char.charCodeAt(0) + ((total << 5) - total), 0);
  const hue = Math.abs(hash * 31 * 31 * 31) % 360;
  return `hsl(${hue}, 40%, 75%)`;
}

function Mark({
  id,
  name,
  size,
  radius,
  textSize,
  url,
}: {
  id: string;
  name: string;
  size: number;
  radius: number;
  textSize: number;
  url?: string | null;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block" }}
      />
    );
  }

  const letters = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect width={size} height={size} fill={uniqueHsl(id)} rx={radius} />
      <text
        x="50%"
        y="50%"
        dy=".1em"
        fill="#373530"
        fontSize={textSize}
        fontWeight={textSize <= 12 ? 600 : 500}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif"
      >
        {letters || "?"}
      </text>
    </svg>
  );
}

function crmPath(homeHref: string, path: string) {
  return `${homeHref.replace(/\/+$/, "")}${path}`;
}

// function openSupport() {
//   const intercom = (window as Window & { Intercom?: (command: string) => void }).Intercom;
//   if (typeof intercom === "function") {
//     intercom("show");
//     return;
//   }
//   window.open("https://help.skarbe.com/", "_blank", "noopener,noreferrer");
// }

function NavButton({ item, pathname }: { item: SidebarNavItem; pathname: string }) {
  const Icon = ICONS[item.icon];
  const active = isSidebarItemActive(pathname, item);
  const className = active ? "pitch-nav-button is-active" : "pitch-nav-button";
  const wrap = item.label.length > 12;
  const content = (
    <>
      <span className="pitch-nav-icon">
        <Icon size={18} />
      </span>
      <span className="pitch-nav-label">{item.label}</span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} className={className} data-wrap={wrap} data-nav-id={item.id}>
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      className={className}
      data-wrap={wrap}
      data-nav-id={item.id}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

export default function AppSidebar({
  menu,
  pathname,
  homeHref,
  userName,
  userId,
  onSignOut,
}: {
  menu: SidebarMenuModel;
  pathname: string;
  homeHref: string;
  userName: string;
  userId: string;
  company?: string;
  onSignOut: () => void;
}) {
  const visibleGroups = menu.groups.filter((group) => group.length > 0);
  const sso = useSsoSession();
  const avatarUrl = sso.user?.avatarUrl;
  const organizationName = sso.user?.org?.name?.trim() || "";
  const organizationPlan = sso.user?.org?.plan?.trim() || "";
  const organizationId = sso.user?.org?.id != null ? String(sso.user.org.id) : userId;
  const organizationMark = organizationName.charAt(0);

  return (
    <aside className="pitch-sidebar" aria-label="PitchSuite">
      <div className="pitch-sidebar-header">
        <a href={homeHref}>
          <img src="/logo-mini.png" alt="Pitchsuite" width={36} height={36} />
        </a>
      </div>

      <div className="pitch-sidebar-scroll">
        {visibleGroups.map((group, index) => (
          <div key={group.map((item) => item.id).join("-")} className="pitch-sidebar-section">
            {index > 0 && <div className="pitch-sidebar-divider" />}
            <div className="pitch-nav-group">
              {group.map((item) => (
                <NavButton key={item.id} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pitch-sidebar-footer">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="pitch-sidebar-trigger" aria-label="Account menu">
              <Mark id={organizationId} name={organizationMark} size={36} radius={4} textSize={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            className="pitch-sidebar-menu"
          >
            <div className="pitch-switch-group">
              <DropdownMenuItem asChild>
                <a href={crmPath(homeHref, "/settings/profile")} className="pitch-switch-button is-profile">
                  <span className="pitch-switch-picture">
                    <Mark id={userId} name={userName} url={avatarUrl} size={28} radius={14} textSize={12} />
                    <span className="pitch-switch-online" />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">{userName}</span>
                  </span>
                </a>
              </DropdownMenuItem>
            </div>

            <div className="pitch-switch-group">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="pitch-switch-button">
                  <span className="pitch-switch-picture">
                    <Mark id={organizationId} name={organizationMark} size={28} radius={4} textSize={14} />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">{organizationName}</span>
                    {organizationPlan ? <span className="pitch-switch-sublabel">{organizationPlan}</span> : null}
                  </span>
                  <span className="pitch-switch-check">
                    <ChevronRight size={16} color="#373530" />
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent sideOffset={6} className="pitch-sidebar-menu pitch-sidebar-menu-nested">
                  <div className="pitch-switch-group">
                    <DropdownMenuItem className="pitch-switch-button">
                      <span className="pitch-switch-picture">
                        <Mark id={organizationId} name={organizationMark} size={28} radius={4} textSize={14} />
                      </span>
                      <span className="pitch-switch-copy">
                        <span className="pitch-switch-label">{organizationName}</span>
                      </span>
                      <span className="pitch-switch-check">
                        <Check size={16} color="#373530" />
                      </span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </div>

            <div className="pitch-switch-group">
              <DropdownMenuItem asChild>
                <a href={crmPath(homeHref, "/settings/referrals")} className="pitch-switch-button">
                  <span className="pitch-switch-icon">
                    <Gift size={16} />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">Refer and earn</span>
                  </span>
                </a>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
                <a
                  href="https://help.skarbe.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pitch-switch-button"
                >
                  <span className="pitch-switch-icon">
                    <BookOpen size={16} />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">Help center</span>
                  </span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="pitch-switch-button" onSelect={openSupport}>
                <span className="pitch-switch-icon">
                  <LifeBuoy size={16} />
                </span>
                <span className="pitch-switch-copy">
                  <span className="pitch-switch-label">Support</span>
                </span>
              </DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                <a href={ACCOUNT_SETTINGS_URL} className="pitch-switch-button">
                  <span className="pitch-switch-icon">
                    <Settings size={16} />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">Settings</span>
                  </span>
                </a>
              </DropdownMenuItem>
            </div>

            <div className="pitch-switch-group">
              <DropdownMenuItem className="pitch-switch-button" onSelect={onSignOut}>
                <span className="pitch-switch-icon">
                  <LogOut size={16} />
                </span>
                <span className="pitch-switch-copy">
                  <span className="pitch-switch-label">Log out</span>
                </span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
