import { useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { isoToDisplayDate, parseDisplayDateToIso } from "../utils/dateUtils";

function DateInput({
  id,
  value = "",
  onChange,
  onBlur,
  disabled = false,
  placeholder = "DD/MM/YYYY",
}) {
  const nativePickerRef = useRef(null);
  const isoValue = parseDisplayDateToIso(value);

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  const handleTextBlur = (e) => {
    const parsedIso = parseDisplayDateToIso(e.target.value);
    if (parsedIso) {
      const normalized = isoToDisplayDate(parsedIso);
      if (normalized !== e.target.value) {
        onChange(normalized);
      }
    }
    if (onBlur) onBlur(e);
  };

  const handleNativePickerChange = (e) => {
    const pickedIso = e.target.value;
    onChange(pickedIso ? isoToDisplayDate(pickedIso) : "");
  };

  const openCalendar = () => {
    if (disabled || !nativePickerRef.current) return;
    if (typeof nativePickerRef.current.showPicker === "function") {
      try {
        nativePickerRef.current.showPicker();
        return;
      } catch {
        // fallback below
      }
    }
    nativePickerRef.current.focus();
    nativePickerRef.current.click();
  };

  return (
    <div className="input-group date-input-group">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={10}
        autoComplete="off"
        className="form-control form-control-custom date-text-input"
      />
      <button
        type="button"
        className="date-calendar-btn"
        onClick={openCalendar}
        disabled={disabled}
        aria-label="Open calendar picker"
        title="Pick from calendar"
      >
        <FaCalendarAlt />
      </button>
      <input
        ref={nativePickerRef}
        type="date"
        value={isoValue}
        onChange={handleNativePickerChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="date-picker-hidden-input"
      />
    </div>
  );
}

export default DateInput;
