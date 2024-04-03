import React, { Component, createRef } from "react";
import "./index.css";

class Dialog extends Component {
  constructor(props) {
    super(props);
    this.modalRef = createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.onConfirm = () => {};
    this.onConfirm = this.props.onConfirm ?? this.onConfirm;
    this.onClose = () => {};
    this.onClose = this.props.onClose ?? this.onClose;
    this.onOpen = () => {};
    this.onOpen = this.props.onOpen ?? this.onOpen;
    this.onCancel = () => {};
    this.onCancel = this.props.onCancel ?? this.onCancel;
  }

  handleKeyDown(evt) {
    evt.preventDefault();
    if (evt.key === "Escape" && this.props.hasCloseListeners) {
      this.onClose();
    }
  }

  handleOutsideClick(evt) {
    if (this.props.hasCloseListeners == false) return;
    if (!this.modalRef.current) return;

    let { clientX, clientY } = evt;
    let { left, right, top, bottom } =
      this.modalRef.current.getBoundingClientRect();

    // note: origin of web page coordinates is at the top left corner of the screen,
    //   larger Y is closer to the bottom of the screen
    let clickedOutside =
      clientX < left || clientX > right || clientY < top || clientY > bottom;

    if (clickedOutside) {
      this.onClose();
    }
  }

  componentDidMount() {
    const modalElement = this.modalRef.current;
    if (modalElement && this.props.isOpen) {
      modalElement.showModal();
      document.addEventListener("mousedown", this.handleOutsideClick);
      this.onOpen();
    }
  }

  // we are using this lifecycle method to check if the modal is closed without clicking on the confirm button
  componentDidUpdate(prevProps) {
    const modalElement = this.modalRef.current;
    if (modalElement && this.props.isOpen && !prevProps.isOpen) {
      modalElement.showModal();
      document.addEventListener("mousedown", this.handleOutsideClick);
      this.onOpen();
    } else if (modalElement && !this.props.isOpen && prevProps.isOpen) {
      modalElement.close();
      document.removeEventListener("mousedown", this.handleOutsideClick);
      this.onClose();
    }
  }

  render() {
    return (
      <dialog
        ref={this.modalRef}
        onKeyDown={this.handleKeyDown}
      >
        <div className="dialog-inner-container">
          {this.props.children}
          <div className="button-container">
            {this.props.confirmButtonText && (
              <button
                onClick={() => {
                  this.onConfirm();
                  this.onClose();
                }}
              >
                {this.props.confirmButtonText}
              </button>
            )}
            {this.props.cancelButtonText && (
              <button
                onClick={() => {
                  this.onCancel();
                  this.onClose();
                }}
              >
                {this.props.cancelButtonText}
              </button>
            )}
          </div>
        </div>
      </dialog>
    );
  }
}

export default Dialog;