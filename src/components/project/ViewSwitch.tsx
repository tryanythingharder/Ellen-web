import styles from "./ViewSwitch.module.scss";

type ViewMode = "overview" | "index";

type ViewSwitchProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewSwitch({ mode, onChange }: ViewSwitchProps) {
  return (
    <nav className={styles.switcher} aria-label="Projects view">
      <button
        data-active={mode === "overview"}
        onClick={() => onChange("overview")}
        type="button"
      >
        <span>Overview</span>
      </button>
      <button
        data-active={mode === "index"}
        onClick={() => onChange("index")}
        type="button"
      >
        <span>Index</span>
      </button>
    </nav>
  );
}
