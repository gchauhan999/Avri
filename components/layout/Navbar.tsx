"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Section";
import {
  ArrowRight,
  ChevronDown,
  Close,
  Mail,
  Menu,
  Phone,
} from "@/components/ui/Icons";
import { company, contact, nav, telHref } from "@/lib/site";
import type { NavItem } from "@/lib/types";

/** Home only matches exactly; every other route matches its own subtree. */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** A parent is highlighted when it, or any of its children, is the open page. */
function isBranchActive(pathname: string, item: NavItem): boolean {
  return (
    isActivePath(pathname, item.href) ||
    (item.children ?? []).some((child) => isActivePath(pathname, child.href))
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop dropdown                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Disclosure menu for a nav item with children. Opens on hover and on click,
 * closes on outside click, Escape, blur out of the menu and route change.
 */
function NavDropdown({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const children = item.children ?? [];
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = isBranchActive(pathname, item);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // A short grace period lets the pointer travel from the trigger to the menu.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Navigating away always closes the menu. Adjusting during render rather than
  // in an effect avoids a frame where the menu hangs over the new page.
  const [renderedFor, setRenderedFor] = useState(pathname);
  if (renderedFor !== pathname) {
    setRenderedFor(pathname);
    if (open) setOpen(false);
  }

  // Click outside.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const focusItem = (index: number) => {
    const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (links.length === 0) return;
    links[(index + links.length) % links.length]?.focus();
  };

  const openAndFocus = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        // Tabbing past the last item leaves the menu — close behind it.
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-current={active ? "true" : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openAndFocus(0);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            openAndFocus(children.length - 1);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          active ? "text-brand-600" : "text-ink-600 hover:text-ink-900"
        }`}
      >
        {item.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
        {active ? (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 -z-10 rounded-full bg-brand-50"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            // The padding keeps the pointer inside the hover area on the way down.
            className="absolute left-0 top-full z-50 pt-2"
          >
            <ul
              id={menuId}
              aria-label={item.label}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                  triggerRef.current?.focus();
                  return;
                }

                const links = linkRefs.current.filter(
                  Boolean
                ) as HTMLAnchorElement[];
                const current = links.indexOf(
                  document.activeElement as HTMLAnchorElement
                );
                if (current === -1) return;

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusItem(current + 1);
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  focusItem(current - 1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  focusItem(0);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  focusItem(links.length - 1);
                }
              }}
              className="w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-xl shadow-ink-900/10"
            >
              {children.map((child, index) => {
                const childActive = isActivePath(pathname, child.href);
                return (
                  <li key={child.href}>
                    <Link
                      ref={(el) => {
                        linkRefs.current[index] = el;
                      }}
                      href={child.href}
                      aria-current={childActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        childActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile menu                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Accordion menu inside the mobile drawer. It mounts with the drawer, so the
 * section holding the current page starts expanded every time it opens.
 */
function MobileNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const [section, setSection] = useState<string | null>(
    () =>
      nav.find((item) => item.children && isBranchActive(pathname, item))
        ?.href ?? null
  );

  return (
    <nav aria-label="Mobile" className="flex flex-col">
      {nav.map((item) => {
        if (!item.children) {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`border-b border-ink-100 py-3.5 text-base font-semibold transition-colors ${
                active ? "text-brand-600" : "text-ink-800"
              }`}
            >
              {item.label}
            </Link>
          );
        }

        const expanded = section === item.href;
        const panelId = `mobile-nav-${item.href.replace(/\W/g, "")}`;

        return (
          <div key={item.href} className="border-b border-ink-100">
            <button
              type="button"
              onClick={() =>
                setSection((current) =>
                  current === item.href ? null : item.href
                )
              }
              aria-expanded={expanded}
              aria-controls={panelId}
              className={`flex w-full items-center justify-between gap-3 py-3.5 text-left text-base font-semibold transition-colors ${
                isBranchActive(pathname, item) ? "text-brand-600" : "text-ink-800"
              }`}
            >
              {item.label}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.ul
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {item.children.map((child) => {
                    const childActive = isActivePath(pathname, child.href);
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          aria-current={childActive ? "page" : undefined}
                          className={`block border-l-2 py-2.5 pl-4 text-sm font-medium transition-colors ${
                            childActive
                              ? "border-brand-500 text-brand-600"
                              : "border-ink-100 text-ink-600"
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                  <li aria-hidden="true" className="h-2" />
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Swap to the condensed glass navbar once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page scrolling behind the open mobile drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility strip — hidden once scrolled to keep the header compact */}
      <div
        className={`hidden overflow-hidden bg-ink-900 text-white/80 transition-all duration-300 lg:block ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
      >
        <Container className="flex h-10 items-center justify-between text-xs">
          <p className="tracking-wide">{contact.address}</p>
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              {contact.email}
            </a>
            <a
              href={telHref(contact.phones[0])}
              className="inline-flex items-center gap-2 font-semibold text-white transition-colors hover:text-brand-300"
            >
              <Phone className="h-3.5 w-3.5" />
              {contact.phones[0]}
            </a>
          </div>
        </Container>
      </div>

      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "glass shadow-[0_6px_28px_-16px_rgb(13_14_17/0.35)]"
            : "bg-white"
        }`}
      >
        <Container
          className={`flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${company.name} — home`}
          >
            <Image
              src="/assets/logo.png"
              alt={`${company.name} logo`}
              width={1600}
              height={800}
              priority
              className={`w-auto transition-all duration-300 ${
                scrolled ? "h-10" : "h-12 sm:h-14"
              }`}
            />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) =>
              item.children ? (
                <NavDropdown key={item.href} item={item} pathname={pathname} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActivePath(pathname, item.href)
                      ? "text-brand-600"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {item.label}
                  {isActivePath(pathname, item.href) ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-brand-50"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/request-a-quote"
              className="hidden items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all hover:bg-brand-600 hover:shadow-md sm:inline-flex"
            >
              Request a Quote
              <ArrowRight />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-800 transition-colors hover:border-brand-500 hover:text-brand-600 lg:hidden"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-ink-100 bg-white lg:hidden"
          >
            <Container className="py-4">
              <MobileNav pathname={pathname} onNavigate={closeMenu} />

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/request-a-quote"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
                >
                  Request a Quote
                  <ArrowRight />
                </Link>
                <a
                  href={telHref(contact.phones[0])}
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-800"
                >
                  <Phone className="h-4 w-4" />
                  {contact.phones[0]}
                </a>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
