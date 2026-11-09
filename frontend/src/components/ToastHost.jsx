import { useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { loginContextObj } from "../contexts/loginContextObj";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

function ToastHost() {
  const { toasts, dismissToast } = useContext(loginContextObj);

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (variant) => {
    switch (variant) {
      case "danger":
        return <FaTimesCircle className="text-danger" />;
      case "warning":
        return <FaExclamationTriangle className="text-warning" />;
      case "info":
        return <FaInfoCircle className="text-primary" />;
      default:
        return <FaCheckCircle className="text-success" />;
    }
  };

  return (
    <ToastContainer
      position="bottom-end"
      className="p-3 position-fixed toast-host-container"
      style={{ zIndex: 1090 }}
    >
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          onClose={() => dismissToast(toastItem.id)}
          show={true}
          delay={3200}
          autohide
          className="shadow-sm border"
        >
          <Toast.Header closeButton className="py-2 border-0 bg-white">
            <span className="me-2 d-inline-flex align-items-center">{getIcon(toastItem.variant)}</span>
            <strong className="me-auto small text-dark">TaskFlow</strong>
          </Toast.Header>
          <Toast.Body className="pt-0 pb-2 px-3 small text-secondary fw-medium">
            {toastItem.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

export default ToastHost;
