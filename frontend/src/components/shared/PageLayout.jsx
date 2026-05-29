import AppHeader from './AppHeader'

export default function PageLayout({ title, subtitle, icon, children }) {
  return (
    <div className="page-layout">
      <AppHeader showBack backLabel="Dashboard" />

      <header className="page-layout__header">
        <span className="page-layout__icon" aria-hidden="true">{icon}</span>
        <div>
          <h1 className="page-layout__title">{title}</h1>
          {subtitle && <p className="page-layout__subtitle">{subtitle}</p>}
        </div>
      </header>

      <main className="page-layout__main">{children}</main>
    </div>
  )
}
