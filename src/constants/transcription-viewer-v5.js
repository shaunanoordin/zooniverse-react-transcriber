//General purpose status states.
export const GENERAL_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  PROCESSING: 'processing',
};

//Extremely specific status states used by the external Messenger transcription database.
//Check out https://github.com/zooniverse/messenger
export const MESSENGER_STATUS = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  AMENDED: 'amended',
  UNREVIEWED: 'unreviewed',
};
