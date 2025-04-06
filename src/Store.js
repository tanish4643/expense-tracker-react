import { useState, useEffect } from 'react';
import { createContainer } from 'react-tracked';

import { loadState, saveState } from './Helpers';

const globalState = {
  user: null
};

const useLocalState = () => {
  const [processedState, setProcessedState] = useState((loadState() || globalState));
  useEffect(() => {
    saveState(processedState);
  }, [processedState]);
  return [processedState, setProcessedState];
};

export const { Provider, useTracked } = createContainer(useLocalState);
