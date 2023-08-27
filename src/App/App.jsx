// BASIC APP VARIANT (without useReducer)

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { Button, ImageGallery, Loader, Modal, Searchbar } from 'components';
import { fetchImages as fetch } from 'api/fetchImages';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Notiflix from 'notiflix';
import styles from './App.module.css';
import { FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import { animateScroll as scroll } from 'react-scroll';

const html = document.querySelector('html');

const galleryState = {
  images: [],
  query: '',
  totalImages: 0,
  prevTotalImages: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_QUERY':
      return {
        ...state,
        query: action.payload,
        images: [],
      };
    case 'FETCH_IMAGES':
      const { hits, totalHits } = action.payload;
      return {
        ...state,
        images: hits ? [...state.images, ...hits] : state.images,
        totalImages: totalHits,
        prevTotalImages: state.totalImages,
      };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, galleryState);
  const [page, setPage] = useState(1);
  const [largeImage, setLargeImage] = useState({ url: '', alt: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState({ top: false, bottom: false });
  const [loadedMore, setLoadedMore] = useState(false);
  const searchbarRef = useRef();

  useEffect(() => {
    dispatch({
      type: 'FETCH_IMAGES',
      payload: { totalHits: state.totalImages },
    });
  }, [state.totalImages]);

  const showScrollers = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const isPageBottom = scrollHeight - scrollTop - clientHeight < 50;
    const isPageTop = scrollTop < 50;

    if (isPageTop && showScroll.bottom && !loadedMore) {
      setShowScroll({ top: false, bottom: true });
    } else if (isPageBottom && showScroll.top) {
      setShowScroll({ top: true, bottom: false });
    } else if (!isPageTop && !isPageBottom) {
      setShowScroll({ top: true, bottom: true });
    }
  }, [showScroll, loadedMore]);

  useEffect(() => {
    window.addEventListener('scroll', showScrollers);
    return () => {
      window.removeEventListener('scroll', showScrollers);
    };
  }, [showScrollers]);

  const autoScroll = direction => {
    if (direction === 'top') {
      scroll.scrollToTop({ duration: 1200 });
    } else {
      scroll.scrollToBottom({ duration: 1200 });
    }
  };

  const loadImages = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(state.query, page);
      dispatch({ type: 'FETCH_IMAGES', payload: response });

      if (response.hits.length === 0) {
        toast.warning(
          'Unfortunately, we could not find anything for your query.'
        );
        dispatch({ type: 'UPDATE_QUERY', payload: '' });
        return;
      }

      if (state.images.length === response.totalHits) {
        toast.success("That's all we found for your query at the moment");
      }
    } catch (error) {
      console.error(error);

      if (searchbarRef.current) {
        searchbarRef.current.value = '';
        searchbarRef.current.blur();
      }

      Notiflix.Report.failure(
        'Oops!',
        'Something went wrong! Please try to reload the page!',
        'Reload',
        () => window.location.reload()
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [state.query, page]);

  useEffect(() => {
    if (state.query) {
      loadImages();
    }
  }, [loadImages, state.query]);

  const handleSubmit = newQuery => {
    if (newQuery !== state.query) {
      dispatch({ type: 'UPDATE_QUERY', payload: newQuery });
      setPage(1);
      setShowScroll({ top: false, bottom: false });
    } else {
      if (state.totalImages === state.prevTotalImages) {
        toast.info(
          <>
            No new images for the query "<strong>{state.query}</strong>"
          </>
        );
      } else {
        const extraImages = state.totalImages - state.prevTotalImages;
        toast.success(
          <>
            We've found <strong>{extraImages}</strong> extra images for the "
            <strong>{state.query}</strong>"
          </>
        );
      }
    }
  };

  const handleImageClick = (largeImageURL, largeImageAlt) => {
    setLargeImage({ url: largeImageURL, alt: largeImageAlt });
    setShowModal(true);
    html.style.overflow = 'hidden';
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
    setLoadedMore(true);
    autoScroll('bottom');
    setTimeout(() => {
      setLoadedMore(false);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    html.style.overflow = 'auto';
  };

  return (
    <div className={styles.App}>
      <Searchbar ref={searchbarRef} onSubmit={handleSubmit} />
      <ImageGallery images={state.images} onImageClick={handleImageClick} />
      {loading && <Loader />}
      {!loading &&
        state.images.length > 0 &&
        state.images.length < state.totalImages && (
          <Button onClick={handleLoadMore} />
        )}
      {showModal && (
        <Modal
          image={largeImage.url}
          alt={largeImage.alt}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
      {showScroll.top && (
        <FiArrowUpCircle
          className={styles.ScrollToTopArrow}
          onClick={() => autoScroll('top')}
        />
      )}
      {showScroll.bottom && !loadedMore && (
        <FiArrowDownCircle
          className={styles.ScrollToBottomArrow}
          onClick={() => autoScroll('bottom')}
        />
      )}
      <ToastContainer autoClose={2800} />
    </div>
  );
};

export default App;
