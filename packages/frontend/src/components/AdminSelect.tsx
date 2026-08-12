import {
  Button,
  makeStyles,
  mergeClasses,
  Text,
} from "@fluentui/react-components";
import { useEffect, useState, type KeyboardEvent } from "react";

export type AdminSelectOption = {
  label: string;
  value: string;
};

type AdminSelectProps = {
  label: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  value: string;
};

export const AdminSelect = ({
  label,
  onChange,
  options,
  value,
}: AdminSelectProps) => {
  const styles = useStyles();
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  const selectOption = (option: AdminSelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const moveActiveIndex = (step: number) => {
    setIsOpen(true);
    setActiveIndex((currentIndex) =>
      Math.min(Math.max(currentIndex + step, 0), options.length - 1),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveIndex(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveIndex(-1);
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <label className={styles.formField}>
      <Text weight="semibold">{label}</Text>
      <div
        className={styles.root}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <Button
          className={styles.trigger}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {selectedOption?.label ?? "Select"}
        </Button>
        {isOpen && (
          <div className={styles.options} role="listbox">
            {options.map((option, index) => (
              <button
                aria-selected={option.value === value}
                className={mergeClasses(
                  styles.option,
                  index === activeIndex && styles.activeOption,
                  option.value === value && styles.selectedOption,
                )}
                key={option.value}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
};

const useStyles = makeStyles({
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  root: {
    position: "relative",
  },
  trigger: {
    alignItems: "center",
    backgroundColor: "#edecea",
    borderBottomColor: "#b8b5ae",
    borderLeftColor: "#b8b5ae",
    borderRightColor: "#b8b5ae",
    borderTopColor: "#b8b5ae",
    borderRadius: "4px",
    boxShadow: "none",
    boxSizing: "border-box",
    color: "#2f2f2f",
    display: "flex",
    fontWeight: 400,
    justifyContent: "space-between",
    minHeight: "2rem",
    padding: "0.3rem 0.7rem",
    textAlign: "left",
    width: "100%",
    "::after": {
      borderLeft: "4px solid transparent",
      borderRight: "4px solid transparent",
      borderTop: "5px solid #57544d",
      content: '""',
      flexShrink: 0,
      height: 0,
      marginLeft: "0.8rem",
      width: 0,
    },
  },
  options: {
    backgroundColor: "#fff",
    borderBottomColor: "#b8b5ae",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    borderLeftColor: "#b8b5ae",
    borderLeftStyle: "solid",
    borderLeftWidth: "1px",
    borderRightColor: "#b8b5ae",
    borderRightStyle: "solid",
    borderRightWidth: "1px",
    borderTopColor: "#b8b5ae",
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.18)",
    left: 0,
    maxHeight: "180px",
    overflowY: "auto",
    position: "absolute",
    right: 0,
    top: "calc(100% + 4px)",
    zIndex: 20,
  },
  option: {
    backgroundColor: "#fff",
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    color: "#2f2f2f",
    display: "block",
    padding: "0.5rem 0.6rem",
    textAlign: "left",
    width: "100%",
  },
  activeOption: {
    backgroundColor: "var(--accent)",
  },
  selectedOption: {
    fontWeight: 700,
  },
});
