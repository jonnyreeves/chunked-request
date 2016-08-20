import typedarray from 'typedarray';

Object.keys(typedarray)
  .forEach(k => {
    if (!window[k]) {
      console.log("=> Polyfilling " + k);
      window[k] = typedarray[k];
    }
  });