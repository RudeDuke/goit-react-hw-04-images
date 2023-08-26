import { useState, useEffect } from 'react';
import { Loader } from 'components';
import styles from './Modal.module.css';
import PropTypes from 'prop-types';

const Modal = ({ image, alt, isOpen, onClose }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayClick = event => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.Overlay} onClick={handleOverlayClick}>
      <div className={styles.Modal}>
        {!loaded && <Loader />}
        <img
          src={image}
          alt={alt}
          onLoad={handleLoad}
          style={{ display: loaded ? 'block' : 'none' }}
        />
        <p>{alt}</p>
      </div>
    </div>
  );
};

Modal.propTypes = {
  image: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default Modal;
