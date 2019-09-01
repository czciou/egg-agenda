'use strict';

const Agenda = require('agenda');
const awaitFirst = require('await-first');

module.exports = app => {
  app.addSingleton('agenda', createClient);
};

function createClient(config, app) {

  const connection_options = {
    db: {
      address: config.db,
      collection: config.collection || 'agendaJob',
      options: { server: { auto_reconnect: true } }
    }
  };
  let agenda = new Agenda(connection_options);

  agenda.name('AGENDA - ' + process.pid);

  // 设置监听
  agenda.on('start', job => {
    app.coreLogger.info('[egg-agenda]', 'agenda启动服务APP: ', job.attrs.name);
  });

  agenda.on('complete', job => {
    app.coreLogger.info('[egg-agenda]', 'agenda完成任务: ', job.attrs.name, job.attrs.data);
    if (!job.attrs.nextRunAt) {
      job.remove(function(err) {
        app.coreLogger.info('[egg-agenda]', 'agenda删除任务: ', err, job.attrs.name);
      });
    }
  });

  agenda.on('fail', job => {
    app.coreLogger.info('[egg-agenda]', '检测到job失败: ', job.attrs.name);
    app.coreLogger.info('[egg-agenda]', '失败时间: ', job.attrs.failedAt);
    app.coreLogger.info('[egg-agenda]', '失败原因: ', job.attrs.failReason);
    agenda.stop();
  });

  agenda.on('ready', async () => {
    await agenda.start();
    app.coreLogger.info('[egg-agenda]', 'agenda启动完毕');
  });

  app.beforeStart(async () => {
    await awaitFirst(agenda, [ 'ready', 'fail' ]);
  });

  return agenda;
}
