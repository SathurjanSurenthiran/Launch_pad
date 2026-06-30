import { useState, useCallback } from 'react';

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        const result = response && Object.prototype.hasOwnProperty.call(response, 'data') 
          ? response.data 
          : response;
        setData(result);
        return result;
      } catch (err) {
        const errMsg = err.response?.data?.message || err.response?.data || err.message || err;
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
}
