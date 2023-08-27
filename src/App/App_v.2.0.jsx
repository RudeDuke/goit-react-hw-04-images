import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, ImageGallery, Loader, Modal, Searchbar } from 'components';
import { fetchImages as fetch } from 'api/fetchImages';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Notiflix from 'notiflix';
import styles from './App.module.css';
import { FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import { animateScroll as scroll } from 'react-scroll';

const html = document.querySelector('html');

const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [totalImages, setTotalImages] = useState(0);
  const [prevTotalImages, setPrevTotalImages] = useState(0);
  const [page, setPage] = useState(1);
  const [largeImage, setLargeImage] = useState({ url: '', alt: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState({ top: false, bottom: false });
  const [loadedMore, setLoadedMore] = useState(false);
  const searchbarRef = useRef();

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
      const response = await fetch(query, page);
      setImages(hits => (hits ? [...hits, ...response.hits] : hits));
      setTotalImages(response.totalHits);
      setPrevTotalImages(totalImages);

      if (response.hits.length === 0) {
        toast.warning(
          'Unfortunately, we could not find anything for your query.'
        );
        setQuery('');
        return;
      }

      if (images.length === response.totalHits) {
        toast.success("That's all we found for your query at the moment");
      }
    } catch (error) {
      console.error(error);

      if (searchbarRef.current) {
        searchbarRef.current.value = '';
        searchbarRef.current.blur();
        Notiflix.Report.failure(
          'Oops!',
          'Something went wrong! Please try to reload the page!',
          'Reload',
          () => window.location.reload()
        );
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [query, page]);

  useEffect(() => {
    if (query) {
      loadImages();
    }
  }, [loadImages, query]);

  const handleSubmit = newQuery => {
    if (newQuery !== query) {
      setQuery(newQuery);
      setImages([]);
      setPage(1);
    } else {
      if (totalImages === prevTotalImages) {
        toast.info(
          <>
            No new images for the query "<strong>{query}</strong>"
          </>
        );
      } else {
        const extraImages = totalImages - prevTotalImages;
        toast.success(
          <>
            We've found <strong>{extraImages}</strong> extra images for the "
            <strong>{query}</strong>"
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
      <ImageGallery images={images} onImageClick={handleImageClick} />
      {loading && <Loader />}
      {!loading && images.length > 0 && images.length < totalImages && (
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
