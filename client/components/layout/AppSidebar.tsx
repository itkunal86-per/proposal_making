import { Link } from "react-router-dom";
import {
  BookOpen,
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
  LifeBuoy,
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

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#373530"
        d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 13 13 0 0 0-.617-1.25.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028 14 14 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13 13 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10 10 0 0 0 .372-.292.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418"
      />
    </svg>
  );
}

function openSupport() {
  const intercom = (window as Window & { Intercom?: (command: string) => void }).Intercom;
  if (typeof intercom === "function") {
    intercom("show");
    return;
  }
  window.open("https://help.skarbe.com/", "_blank", "noopener,noreferrer");
}

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
  company,
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
  const workspaceName = company?.trim() || userName;
  const visibleGroups = menu.groups.filter((group) => group.length > 0);
  const sso = useSsoSession();
  const avatarUrl = sso.user?.avatarUrl;
  const organizationName = sso.user?.org?.name?.trim() || workspaceName;
  const organizationPlan = sso.user?.org?.plan?.trim() || "";
  const organizationId = sso.user?.org?.id != null ? String(sso.user.org.id) : company || userId;
  const settingsHref = menu.settingsHref;

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
              <Mark id={organizationId} name={organizationName.charAt(0)} size={36} radius={4} textSize={14} />
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
                    <Mark id={organizationId} name={organizationName.charAt(0)} size={28} radius={4} textSize={14} />
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
                        <Mark id={organizationId} name={organizationName.charAt(0)} size={28} radius={4} textSize={14} />
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
                <a
                  href="https://discord.gg/skarbe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pitch-switch-button"
                >
                  <span className="pitch-switch-icon">
                    <DiscordIcon />
                  </span>
                  <span className="pitch-switch-copy">
                    <span className="pitch-switch-label">Join our Discord</span>
                  </span>
                </a>
              </DropdownMenuItem>
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
              <DropdownMenuItem asChild>
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
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {settingsHref ? (
                  <Link to={settingsHref} className="pitch-switch-button">
                    <span className="pitch-switch-icon">
                      <Settings size={16} />
                    </span>
                    <span className="pitch-switch-copy">
                      <span className="pitch-switch-label">Settings</span>
                    </span>
                  </Link>
                ) : (
                  <a href={crmPath(homeHref, "/settings")} className="pitch-switch-button">
                    <span className="pitch-switch-icon">
                      <Settings size={16} />
                    </span>
                    <span className="pitch-switch-copy">
                      <span className="pitch-switch-label">Settings</span>
                    </span>
                  </a>
                )}
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
