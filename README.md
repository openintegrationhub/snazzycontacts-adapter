# Snazzy-Adapter

[Snazzy Contacts](https://snazzycontacts.com) is a smart contact management software for controlling, organizing and managing your contacts data. With [Snazzy Contacts](https://snazzycontacts.com) you could manage your entire team contacts(contacts and organizations) and work flexibly together with your colleagues. You are able to maintain your addresses on all devices from everywhere.

This **adapter** connects [Snazzy Contacts](https://snazzycontacts.com) with third-party applications. With this **adapter** you are able to create different application flows. It supports **"Triggers"** (e.g. ``getPersonsPolling``, ``getOrganizationsPolling``) as well as **"Actions"** (e.g. ``upsertPerson``, ``upsertOrganization``, etc.), therefore with this **adapter** you could both read and fetch data from [Snazzy Contacts](https://snazzycontacts.com) and write and save data in [Snazzy Contacts](https://snazzycontacts.com).

## Before you begin

Before you can use the adapter you **must be a registered Snazzy Contacts user**. Please visit the home page of [snazzycontacts.com](https://snazzycontacts.com) to sign up.
> Any attempt to reach [Snazzy Contacts](https://snazzycontacts.com) endpoints without registration will not be successful!

## Authorization
Each request to Snazzy Contacts API requires an authorization. To do so, pass either a generated apiKey or your username and password through the config.


## Actions and triggers
The **adapter** supports the following **actions** and **triggers**:

#### Triggers:
  - Get persons - polling (```getPersonsPolling.js```)
  - Get organizations - polling (```getOrganizationsPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these objects from the database that have been modified or created since the previous execution. Then it will emit one message per object that changes or is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

#### Actions:
  - Upsert person (```upsertPerson.js```)
  - Upsert organization(```upsertOrganization.js```)


In each trigger and action, before sending a request we get the token from [Snazzy Contacts](https://snazzycontacts.com) via calling the function ```getToken()``` from ```snazzy.js``` file, which is located in directory **utils**. This function returns a token which is used when we send a request to
[Snazzy Contacts](https://snazzycontacts.com).

##### Get persons

Get persons trigger (```getPersonsPolling.js```) performs a request which fetch all persons saved by a user in [Snazzy Contacts](https://snazzycontacts.com).

##### Get organizations

Get organizations trigger (```getOrganizationsPolling.js```) performs a request which fetch all organizations saved by a user in [Snazzy Contacts](https://snazzycontacts.com).

##### Upsert person

Upsert person action (``upsertPerson.js``) updates an existing person if it already exists. Otherwise it creates a new one.

##### Upsert organization

Upsert organization action (``upsertOrganization.js``) updates an existing organization if it already exists. Otherwise it creates a new one.

## Integrated Transformations

As of version 2.0.0, transformations to and from the OIH contact master data model are integrated into the relevant actions/triggers by default. This means that it is no longer necessary to run a separate SnazzyContacts Transformer in flows containing this Adapter.

If you would like to use the old behaviour without integrated transformations, simply set `skipTransformation: true` in the `fields` object of your flow configuration. Alternatively, you can also inject a valid, stringified JSONata expression in the `customMapping` key of the `fields` object, which will be used instead of the integrated transformation.

## Sending of delete messages

This connector can retrieve entries that are deleted since the last snapshot and send a OIH delete message. For this to work OIH-ID-Linking must be activated and the Snazzy-Step of the flow requires at least the following parameters:

```
nodeSettings: {
  idLinking: true,
  applicationUid: 'snazzy'
},
fields: {
  targetApp: 'Name of Target App',
  snazzyFlowVersion: 2,
  deletes: true,
}
```

## Receiving of delete messages

This connector can receive OIH Delete messages and delete the corresponding entry in SNAZZY Contacts. For this to work OIH-ID-Linking must be activated and the Snazzy-Step of the flow requires at least the following parameters:

```
"nodeSettings":{
   "idLinking":true,
   "applicationUid":"snazzy",
   "alternateAppUid":"AppId of source app"
},
"fields":{
   "devMode":true,
   "sourceApp":"AppId of source app",
   "snazzyFlowVersion":2,
   "deletes": true
}
```

## Format of OIH delete messages

```
{
    metadata: {
        recordUid: 'some id'
        oihUid: '123',
        applicationUid: 'xy',
    },
    data: {
        deleteRequested: 'timestamp as string',
    }
}
```

## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
