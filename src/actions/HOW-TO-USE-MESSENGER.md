# How To Use Messenger (Front-End Dev Edition)

This is a quick guide on how to use the Messenger service, from a Front-End Dev's perspective.

It'll be handy when you're trying to create a Transcription-based Custom Front-End project and need the Messenger service to store amended/approved/rejected Transcriptions.

## 0. Setup

Here's a checklist of things to do before starting your Custom Front-End project that accesses the Messenger service.

* Are you clear whether your project is using `staging` or `production`?
  * There are `staging` and `production` versions of Messenger, so make sure your choice of environment matches.
  * Reminder: if your web-based CFE uses the [Panoptes Javascript Client](https://www.npmjs.com/package/panoptes-client) [(src)](https://github.com/zooniverse/panoptes-javascript-client/), you can switch enviornments by appending `?env=staging` to your URL.
* Have you created a Panoptes App for your CFE?
  * If not, go to [https://panoptes.zooniverse.org/oauth/applications](https://panoptes.zooniverse.org/oauth/applications) or [https://panoptes-staging.zooniverse.org/oauth/applications](https://panoptes-staging.zooniverse.org/oauth/applications).
* Can you **login to your CFE using your Zooniverse account?** 
  * i.e. Have you configured your CFE to connect to the Panoptes auth systems? Check your environment, Panoptes App ID, and the valid Callback URLs in the Panoptes OAuth2 Provider/Doorkeeper (links above).
  * Reminder: on your first login to your CFE, you should be asked to _authorise the Panoptes App._
* Are you the owner or collaborator of the Project?
  * You cannot add Transcriptions to Subjects belonging to a Project where you're not an owner/collaborator.

Be aware that the Messenger service has different URLs for its `staging` and `production` settings.
* `staging` - `https://messenger-staging.zooniverse.org/`
* `production` - TBC

## 1. Register a Project

Before you start adding Transcriptions to Subjects, you first need to register the Panoptes Project that the Subjects belong to.

This uses the `POST /projects` functionality of the Messenger service, and should only be done **once.** Attempting to register the same project multiple times will net you a bunch of errors.

Here's an example of registering (on `staging`) Project 1651, aka `darkeshard/transfromers`:

```
import apiClient from 'panoptes-client/lib/api-client.js';

var url = 'https://messenger-staging.zooniverse.org/projects/' +
          '?slug=' + encodeURIComponent('darkeshard/transformers');  //OK, honestly, I'm not sure if this ?slug part is necessary, but my personal notes says yes? (@shaun.a.noordin 20170630)

var body = JSON.stringify({  //Reminder: turn your JSON objects into strings
  'data': {
    'attributes': {
      'slug': 'darkeshard/transformers'
    }
  }
});

const opt = {
  method: 'POST',
  mode: 'cors',
  headers: new Headers({
    'Authorization': apiClient.headers.Authorization,
    'Content-Type': 'application/json',
  }),
  body: body,
};

console.log('REGISTER PROJECT: start');

fetch(url, opt)
.then((response) => {
  if (response.status < 200 || response.status > 202) { return null; }
  return response.json();
})
.then((json) => {
  if (json && json.data) {
    console.log('REGISTER PROJECT: completed.');
  }
})
.catch((err) => {
  ...
});

```

Expected Results:
* If successful, you should see the `darkeshard/transformers` Project listed when you access `GET /projects/1651`.

Common Problems:
* If you're seeing 401 Unauthorized errors, chances are you're either:
  * Not logged into Panoptes.
  * Logged into `staging` instead of `production` or vice versa.
  * Logged into an account that's not the owner/collaborator of the Project.
* Strangely, we've also experienced 401 errors when the `body` string isn't properly structured. Double check your `body`: it should just be data->attributes->slug.

## 2. Add a Transcription

If a Transcription does not yet exist in the Messenger's database, you'll first need to add it using `POST /transcriptions`.

Here's an example of adding a Transcription for (staging) Subject 48407, which is a picture of Optimus Prime.

```
import apiClient from 'panoptes-client/lib/api-client.js';

var url = 'https://messenger-staging.zooniverse.org/transcriptions/';

var body = JSON.stringify({
  'data': {
    'attributes': {
      'id': '48407',
      'text': 'Hello Optimus Prime',
      'status': 'amended',
    },
    'relationships': {
      'project': {
        'data': {
          'type': 'projects',
          'id': '1651',
        }
      }
    },
  }
});

const opt = {
  method: 'POST',
  mode: 'cors',
  headers: new Headers({
    'Authorization': apiClient.headers.Authorization,
    'Content-Type': 'application/json',
  }),
  body: body,
};

fetch(url, opt)
.then((response) => {
  ...
})
```

There's also an alternative way to structure the body, but maybe don't do this?

```
var alternate_body_format = JSON.stringify({
  'data': {
    'attributes': {
      'id': '48407',
      'project_id': '1651',
      'text': 'Hello Optimus Prime',
      'status': 'amended',
    }
  }
});
```

Expected Results:
* If successful, you should see the Transcription (with text: 'Hello Optimus Prime' and status: 'amended') for Subject 48407 when you access `GET /transcriptions/48407`.

Common Problems:
* Check if the Transcription already exists - POST only works when adding a fresh new Transcription.
* If you're seeing 401 Unauthorized errors, chances are you're either:
  * Not logged into Panoptes
  * Logged into `staging` instead of `production` or vice versa
  * Logged into an account that's not the owner/collaborator of the Project.
  * Using a `body` that isn't structured properly - be sure that 'id', project_id, and 'text' are defined.
    * Also ensure that 'status' corresponds to one of the valid values, e.g. 'amended'.

## 3. Edit a Transcription

If a Transcription already exists, you can edit its values by using `PUT /transcriptions/:id`

(Reminder: an easy way to check if a Transcription already exists is to access `GET /transcriptions/:id`)

Here's an example of updating the Transcription for (staging) Subject 48407.

```
import apiClient from 'panoptes-client/lib/api-client.js';

var url = 'https://messenger-staging.zooniverse.org/transcriptions/48407';

var body = JSON.stringify({
  'data': {
    'attributes': {
      'id': '48407',
      'text': 'Optimus Prime prepare to transform and roll out',
      'status': 'amended',
    }
  }
});

const opt = {
  method: 'PUT',
  mode: 'cors',
  headers: new Headers({
    'Authorization': apiClient.headers.Authorization,
    'Content-Type': 'application/json',
  }),
  body: body,
};

fetch(url, opt)
.then((response) => {
  ...
})
```

Expected Results:
* If successful, you should see the updated Transcription when you access `GET /transcriptions/48407`.

Common Problems:
* Check if the Transcription DOESN'T already exists - PUT only works for EXISTING Transcription.
* Again, if you're encountering 401 Unauthorized errors, check that you're logged in correctly, have access to the Project, structured the body correctly, etc. 
