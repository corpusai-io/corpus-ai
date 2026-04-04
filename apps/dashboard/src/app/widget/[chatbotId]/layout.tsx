/**
 * Minimal layout for the embeddable widget route.
 * No sidebar, no header, no auth required.
 */
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="widget-root">
      {children}
    </div>
  );
}
