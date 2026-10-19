import ControlDock from './ControlDock'

export default function LeftRail() {
  return (
    <aside
      aria-label="Floating display controls"
      className="fixed top-1/2 left-3 z-40 hidden -translate-y-1/2 flex-col items-start gap-3 xl:flex"
    >
      <ControlDock />
    </aside>
  )
}
