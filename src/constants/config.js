var DEFAULT_ENV = 'staging';
var envFromBrowser = locationMatch(/\W?env=(\w+)/);
var envFromShell = process.env.NODE_ENV;
var env = envFromBrowser || envFromShell || DEFAULT_ENV;

if (!env.match(/^(production|staging|development)$/)) {
  throw new Error('Error: Invalid Environment');
}

const baseConfig = {
  'development': {
    panoptesAppId: '5180e821286b5296be3f5305f0c8c5f9beaf2050b6473b73f9fb7e8d86676bb8',  //(staging)
    transcriptionsDatabaseUrl: 'https://messenger-staging.zooniverse.org/',
    projectId: '1651',  //staging: darkeshard/transformers
  },
  'staging': {
    panoptesAppId: '5180e821286b5296be3f5305f0c8c5f9beaf2050b6473b73f9fb7e8d86676bb8',  //(staging)
    transcriptionsDatabaseUrl: 'https://messenger-staging.zooniverse.org/',
    projectId: '1651',  //staging: darkeshard/transformers
  },
  'production': {
    panoptesAppId: 'c25caf9781db436c7d7ec0cfe81926696d24886908d15cbfe0c63391a627832b',  //(production) Panoptes ID for Zooniverse React Transcriber
    transcriptionsDatabaseUrl: 'https://messenger.zooniverse.org/',
    projectId: '245',  //staging: drrogg/annotate
  },
};

const config = baseConfig[env];

export { env, config };

// Try and match the location.search property against a regex. Basically mimics
// the CoffeeScript existential operator, in case we're not in a browser.
function locationMatch(regex) {
  var match;
  if (typeof location !== 'undefined' && location !== null) {
    match = location.search.match(regex);
  }

  return (match && match[1]) ? match[1] : undefined;
}