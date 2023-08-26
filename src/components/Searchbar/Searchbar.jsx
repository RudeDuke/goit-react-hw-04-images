import { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Searchbar.module.css';
import { toast } from 'react-toastify';
import { ImSearch } from 'react-icons/im';
import { FiX } from 'react-icons/fi';

const Searchbar = forwardRef(({ onSubmit }, inputRef) => {
  const [query, setQuery] = useState('');

  const handleChange = event => {
    setQuery(event.currentTarget.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (query.trim() === '') {
      toast.warning('Please enter what you are looking for 😊.');
      return;
    }
    onSubmit(query);
  };

  const clearInput = () => {
    setQuery('');
    inputRef.current.focus();
  };

  return (
    <div className={styles.Searchbar}>
      <form className={styles.SearchForm} onSubmit={handleSubmit}>
        <button type="submit" className={styles.SearchButton}>
          <ImSearch />
        </button>

        <input
          className={styles.SearchForm_input}
          type="text"
          name="search"
          autoComplete="off"
          autoFocus
          placeholder="Search images and photos"
          value={query}
          onChange={handleChange}
          ref={inputRef}
        />

        {query && (
          <button
            type="button"
            className={styles.ClearButton}
            onClick={clearInput}
          >
            <FiX />
          </button>
        )}
      </form>
    </div>
  );
});

Searchbar.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Searchbar;
