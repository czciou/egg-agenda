# egg agenda

## install
```
npm install egg-agenda
```

## Usage

- add config in config/plugin.js

```
exports.agenda = {
  enable: true,
  package: 'egg-agenda',
};
```

- add config in config/config.default.js

```
config.agenda = {
  client: {
    db: 'xxx',
    collection: 'xx' // 可选
  }
};
```
