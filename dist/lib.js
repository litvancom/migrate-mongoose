'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

require('colors');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MigrationModel = void 0;

_bluebird2.default.config({
  warnings: true
});

_mongoose2.default.Promise = _bluebird2.default;

var es6Template = '\n/**\n * Make any changes you need to make to the database here\n */\nexport async function up () {\n  // Write migration here\n}\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexport async function down () {\n  // Write migration here\n}\n';

var es5Template = '\'use strict\';\n\n/**\n * Make any changes you need to make to the database here\n */\nexports.up = function up (done) {\n  done();\n};\n\n/**\n * Make any changes that UNDO the up function side effects here (if possible)\n */\nexports.down = function down(done) {\n  done();\n};\n';

var Migrator = function () {
  function Migrator(_ref) {
    var templatePath = _ref.templatePath,
        _ref$migrationsPath = _ref.migrationsPath,
        migrationsPath = _ref$migrationsPath === undefined ? './migrations' : _ref$migrationsPath,
        dbConnectionUri = _ref.dbConnectionUri,
        _ref$es6Templates = _ref.es6Templates,
        es6Templates = _ref$es6Templates === undefined ? false : _ref$es6Templates,
        _ref$collectionName = _ref.collectionName,
        collectionName = _ref$collectionName === undefined ? 'migrations' : _ref$collectionName,
        _ref$autosync = _ref.autosync,
        autosync = _ref$autosync === undefined ? false : _ref$autosync,
        _ref$cli = _ref.cli,
        cli = _ref$cli === undefined ? false : _ref$cli;
    (0, _classCallCheck3.default)(this, Migrator);

    var defaultTemplate = es6Templates ? es6Template : es5Template;
    this.template = templatePath ? _fs2.default.readFileSync(templatePath, 'utf-8') : defaultTemplate;
    this.migrationPath = _path2.default.resolve(migrationsPath);
    this.connection = _mongoose2.default.createConnection(dbConnectionUri);
    this.es6 = es6Templates;
    this.collection = collectionName;
    this.autosync = autosync;
    this.cli = cli;
    MigrationModel = (0, _db2.default)(collectionName, this.connection);
  }

  (0, _createClass3.default)(Migrator, [{
    key: 'log',
    value: function log(logString) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force || this.cli) {
        console.log(logString);
      }
    }
  }, {
    key: 'close',
    value: function close() {
      return this.connection ? this.connection.close() : null;
    }
  }, {
    key: 'create',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(migrationName) {
        var existingMigration, now, newMigrationFile, migrationCreated;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return MigrationModel.findOne({ name: migrationName });

              case 3:
                existingMigration = _context.sent;

                if (!existingMigration) {
                  _context.next = 6;
                  break;
                }

                throw new Error(('There is already a migration with name \'' + migrationName + '\' in the database').red);

              case 6:
                _context.next = 8;
                return this.sync();

              case 8:
                now = Date.now();
                newMigrationFile = now + '-' + migrationName + '.js';

                _mkdirp2.default.sync(this.migrationPath);
                _fs2.default.writeFileSync(_path2.default.join(this.migrationPath, newMigrationFile), this.template);
                // create instance in db
                _context.next = 14;
                return this.connection;

              case 14:
                _context.next = 16;
                return MigrationModel.create({
                  name: migrationName,
                  createdAt: now
                });

              case 16:
                migrationCreated = _context.sent;

                this.log('Created migration ' + migrationName + ' in ' + this.migrationPath + '.');
                return _context.abrupt('return', migrationCreated);

              case 21:
                _context.prev = 21;
                _context.t0 = _context['catch'](0);

                this.log(_context.t0.stack);
                fileRequired(_context.t0);

              case 25:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 21]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()

    /**
     * Runs migrations up to or down to a given migration name
     *
     * @param migrationName
     * @param direction
     */

  }, {
    key: 'run',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'up';
        var migrationName = arguments[1];

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration, migrationFilePath, modulesPath, code, migrationFunctions, callPromise;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.sync();

              case 2:
                if (!migrationName) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 5;
                return MigrationModel.findOne({ name: migrationName });

              case 5:
                _context2.t0 = _context2.sent;
                _context2.next = 11;
                break;

              case 8:
                _context2.next = 10;
                return MigrationModel.findOne().sort({ createdAt: -1 });

              case 10:
                _context2.t0 = _context2.sent;

              case 11:
                untilMigration = _context2.t0;

                if (untilMigration) {
                  _context2.next = 18;
                  break;
                }

                if (!migrationName) {
                  _context2.next = 17;
                  break;
                }

                throw new ReferenceError('Could not find that migration in the database');

              case 17:
                throw new Error('There are no pending migrations.');

              case 18:
                query = {
                  createdAt: { $lte: untilMigration.createdAt },
                  state: 'down'
                };


                if (direction == 'down') {
                  query = {
                    createdAt: { $gte: untilMigration.createdAt },
                    state: 'up'
                  };
                }

                sortDirection = direction == 'up' ? 1 : -1;
                _context2.next = 23;
                return MigrationModel.find(query).sort({ createdAt: sortDirection });

              case 23:
                migrationsToRun = _context2.sent;

                if (migrationsToRun.length) {
                  _context2.next = 31;
                  break;
                }

                if (!this.cli) {
                  _context2.next = 30;
                  break;
                }

                this.log('There are no migrations to run'.yellow);
                this.log('Current Migrations\' Statuses: ');
                _context2.next = 30;
                return this.list();

              case 30:
                throw new Error('There are no migrations to run');

              case 31:
                self = this;
                numMigrationsRan = 0;
                migrationsRan = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context2.prev = 37;
                _iterator = (0, _getIterator3.default)(migrationsToRun);

              case 39:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context2.next = 77;
                  break;
                }

                migration = _step.value;
                migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);
                modulesPath = _path2.default.resolve(__dirname, '../', 'node_modules');
                code = _fs2.default.readFileSync(migrationFilePath);

                if (this.es6) {
                  require('babel-register')({
                    presets: [require('babel-preset-latest')],
                    plugins: [require('babel-plugin-transform-runtime')]
                  });

                  require('babel-polyfill');
                }

                migrationFunctions = void 0;
                _context2.prev = 46;

                migrationFunctions = require(migrationFilePath);
                _context2.next = 54;
                break;

              case 50:
                _context2.prev = 50;
                _context2.t1 = _context2['catch'](46);

                _context2.t1.message = _context2.t1.message && /Unexpected token/.test(_context2.t1.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t1.message;
                throw _context2.t1;

              case 54:
                if (migrationFunctions[direction]) {
                  _context2.next = 56;
                  break;
                }

                throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

              case 56:
                _context2.prev = 56;

                // await new Promise( (resolve, reject) => {
                //   const callPromise =  migrationFunctions[direction].call(
                //     this.connection.model.bind(this.connection),
                //     function callback(err) {
                //       if (err) return reject(err);
                //       resolve();
                //     }
                //   );
                //
                //   if (callPromise && typeof callPromise.then === 'function') {
                //     callPromise.then(resolve).catch(reject);
                //   }
                // });

                // const callPromise =  migrationFunctions[direction].call(
                //   this.connection.model.bind(this.connection),
                //   err => {
                //     if (err) throw err;
                //     resolve();
                //   }
                // );
                //
                // if (callPromise && typeof callPromise.then === 'function') {
                //   await callPromise
                // }

                callPromise = migrationFunctions[direction];

                callPromise.bind(this.connection.model.bind(this.connection));
                _context2.next = 61;
                return callPromise();

              case 61:

                this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                _context2.next = 64;
                return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

              case 64:
                migrationsRan.push(migration.toJSON());
                numMigrationsRan++;
                _context2.next = 74;
                break;

              case 68:
                _context2.prev = 68;
                _context2.t2 = _context2['catch'](56);

                console.error(_context2.t2);
                this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                this.log('Not continuing. Make sure your data is in consistent state'.red);
                throw _context2.t2 instanceof Error ? _context2.t2 : new Error(_context2.t2);

              case 74:
                _iteratorNormalCompletion = true;
                _context2.next = 39;
                break;

              case 77:
                _context2.next = 83;
                break;

              case 79:
                _context2.prev = 79;
                _context2.t3 = _context2['catch'](37);
                _didIteratorError = true;
                _iteratorError = _context2.t3;

              case 83:
                _context2.prev = 83;
                _context2.prev = 84;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 86:
                _context2.prev = 86;

                if (!_didIteratorError) {
                  _context2.next = 89;
                  break;
                }

                throw _iteratorError;

              case 89:
                return _context2.finish(86);

              case 90:
                return _context2.finish(83);

              case 91:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context2.abrupt('return', migrationsRan);

              case 93:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[37, 79, 83, 91], [46, 50], [56, 68], [84,, 86, 90]]);
      }));

      function run() {
        return _ref3.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Looks at the file system migrations and imports any migrations that are
     * on the file system but missing in the database into the database
     *
     * This functionality is opposite of prune()
     */

  }, {
    key: 'sync',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var _this = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context3.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context3.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js$/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                filesNotInDb = _lodash2.default.filter(migrationsInFolder, { existsInDatabase: false }).map(function (f) {
                  return f.filename;
                });
                migrationsToImport = filesNotInDb;

                this.log('Synchronizing database with file system migrations...');

                if (!(!this.autosync && migrationsToImport.length)) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 12;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the migrations folder but not in the database. Select the ones you want to import into the database',
                    name: 'migrationsToImport',
                    choices: filesNotInDb
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 12:
                answers = _context3.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context3.abrupt('return', _bluebird2.default.map(migrationsToImport, function (migrationToImport) {
                  var filePath = _path2.default.join(_this.migrationPath, migrationToImport),
                      timestampSeparatorIndex = migrationToImport.indexOf('-'),
                      timestamp = migrationToImport.slice(0, timestampSeparatorIndex),
                      migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));

                  _this.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                  return MigrationModel.create({
                    name: migrationName,
                    createdAt: timestamp
                  }).then(function (createdMigration) {
                    return createdMigration.toJSON();
                  });
                }));

              case 17:
                _context3.prev = 17;
                _context3.t0 = _context3['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context3.t0;

              case 21:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 17]]);
      }));

      function sync() {
        return _ref4.apply(this, arguments);
      }

      return sync;
    }()

    /**
     * Opposite of sync().
     * Removes files in migration directory which don't exist in database.
     */

  }, {
    key: 'prune',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, dbMigrationsNotOnFs, migrationsToDelete, answers, migrationsToDeleteDocs;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context4.next = 4;
                return MigrationModel.find({}).lean();

              case 4:
                migrationsInDatabase = _context4.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = !!_lodash2.default.find(migrationsInDatabase, { createdAt: new Date(fileCreatedAt) });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                dbMigrationsNotOnFs = _lodash2.default.filter(migrationsInDatabase, function (m) {
                  return !_lodash2.default.find(migrationsInFolder, { filename: m.filename });
                });
                migrationsToDelete = dbMigrationsNotOnFs.map(function (m) {
                  return m.name;
                });

                if (!(!this.autosync && !!migrationsToDelete.length)) {
                  _context4.next = 13;
                  break;
                }

                _context4.next = 11;
                return new _bluebird2.default(function (resolve) {
                  _inquirer2.default.prompt({
                    type: 'checkbox',
                    message: 'The following migrations exist in the database but not in the migrations folder. Select the ones you want to remove from the file system.',
                    name: 'migrationsToDelete',
                    choices: migrationsToDelete
                  }, function (answers) {
                    resolve(answers);
                  });
                });

              case 11:
                answers = _context4.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context4.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context4.sent;

                if (!migrationsToDelete.length) {
                  _context4.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context4.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context4.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context4.prev = 23;
                _context4.t0 = _context4['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context4.t0;

              case 27:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 23]]);
      }));

      function prune() {
        return _ref5.apply(this, arguments);
      }

      return prune;
    }()

    /**
     * Lists the current migrations and their statuses
     * @returns {Promise<Array<Object>>}
     * @example
     *   [
     *    { name: 'my-migration', filename: '149213223424_my-migration.js', state: 'up' },
     *    { name: 'add-cows', filename: '149213223453_add-cows.js', state: 'down' }
     *   ]
     */

  }, {
    key: 'list',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var _this2 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.sync();

              case 2:
                _context5.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context5.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context5.abrupt('return', migrations.map(function (m) {
                  _this2.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function list() {
        return _ref6.apply(this, arguments);
      }

      return list;
    }()
  }]);
  return Migrator;
}();

exports.default = Migrator;


function fileRequired(error) {
  if (error && error.code == 'ENOENT') {
    throw new ReferenceError('Could not find any files at path \'' + error.path + '\'');
  }
}

module.exports = Migrator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJQcm9taXNlIiwiY29uZmlnIiwid2FybmluZ3MiLCJtb25nb29zZSIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImRlZmF1bHRUZW1wbGF0ZSIsInRlbXBsYXRlIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJtaWdyYXRpb25QYXRoIiwicGF0aCIsInJlc29sdmUiLCJjb25uZWN0aW9uIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJta2RpcnAiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJwcmVzZXRzIiwicGx1Z2lucyIsIm1pZ3JhdGlvbkZ1bmN0aW9ucyIsIm1lc3NhZ2UiLCJ0ZXN0IiwiY2FsbFByb21pc2UiLCJiaW5kIiwibW9kZWwiLCJ0b1VwcGVyQ2FzZSIsIndoZXJlIiwidXBkYXRlIiwiJHNldCIsInB1c2giLCJ0b0pTT04iLCJlcnJvciIsImdyZWVuIiwiZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciIsInJlYWRkaXJTeW5jIiwibWlncmF0aW9uc0luRGF0YWJhc2UiLCJtaWdyYXRpb25zSW5Gb2xkZXIiLCJfIiwiZmlsdGVyIiwiZmlsZSIsIm1hcCIsImZpbGVDcmVhdGVkQXQiLCJwYXJzZUludCIsInNwbGl0IiwiZXhpc3RzSW5EYXRhYmFzZSIsInNvbWUiLCJtIiwiZmlsZXNOb3RJbkRiIiwiZiIsIm1pZ3JhdGlvbnNUb0ltcG9ydCIsImFzayIsInByb21wdCIsInR5cGUiLCJjaG9pY2VzIiwiYW5zd2VycyIsImZpbGVQYXRoIiwibWlncmF0aW9uVG9JbXBvcnQiLCJ0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJ0aW1lc3RhbXAiLCJzbGljZSIsImxhc3RJbmRleE9mIiwidGhlbiIsImNyZWF0ZWRNaWdyYXRpb24iLCJsZWFuIiwiZGJNaWdyYXRpb25zTm90T25GcyIsIm1pZ3JhdGlvbnNUb0RlbGV0ZSIsIiRpbiIsIm1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MiLCJjeWFuIiwicmVtb3ZlIiwibWlncmF0aW9ucyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBQ0EsSUFBSUEsdUJBQUo7O0FBRUFDLG1CQUFRQyxNQUFSLENBQWU7QUFDYkMsWUFBVTtBQURHLENBQWY7O0FBSUFDLG1CQUFTSCxPQUFULEdBQW1CQSxrQkFBbkI7O0FBRUEsSUFBTUksOFNBQU47O0FBZ0JB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QUFXLElBQVgsR0FBa0IsT0FBbEIsR0FBNEIsS0FBekUsV0FBc0YrQyxFQUFFbEMsUUFBeEYsQ0FBVDtBQUNBLHlCQUFPa0MsRUFBRWhCLE1BQUYsRUFBUDtBQUNELGlCQUhNLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQXBUVS9FLFE7OztBQTJUckIsU0FBU3lDLFlBQVQsQ0FBc0J1QyxLQUF0QixFQUE2QjtBQUMzQixNQUFJQSxTQUFTQSxNQUFNaEIsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSW5CLGNBQUoseUNBQXdEbUMsTUFBTW5FLElBQTlELFFBQU47QUFDRDtBQUNGOztBQUVENEcsT0FBT0MsT0FBUCxHQUFpQjFILFFBQWpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAnY29sb3JzJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGFzayBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCBNaWdyYXRpb25Nb2RlbEZhY3RvcnkgZnJvbSAnLi9kYic7XG5sZXQgTWlncmF0aW9uTW9kZWw7XG5cblByb21pc2UuY29uZmlnKHtcbiAgd2FybmluZ3M6IHRydWVcbn0pO1xuXG5tb25nb29zZS5Qcm9taXNlID0gUHJvbWlzZTtcblxuY29uc3QgZXM2VGVtcGxhdGUgPSBgXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXAgKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgdGhhdCBVTkRPIHRoZSB1cCBmdW5jdGlvbiBzaWRlIGVmZmVjdHMgaGVyZSAoaWYgcG9zc2libGUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3duICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cbmA7XG5cbmNvbnN0IGVzNVRlbXBsYXRlID0gYCd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0cy51cCA9IGZ1bmN0aW9uIHVwIChkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0cy5kb3duID0gZnVuY3Rpb24gZG93bihkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWdyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0ZW1wbGF0ZVBhdGgsXG4gICAgbWlncmF0aW9uc1BhdGggPSAnLi9taWdyYXRpb25zJyxcbiAgICBkYkNvbm5lY3Rpb25VcmksXG4gICAgZXM2VGVtcGxhdGVzID0gZmFsc2UsXG4gICAgY29sbGVjdGlvbk5hbWUgPSAnbWlncmF0aW9ucycsXG4gICAgYXV0b3N5bmMgPSBmYWxzZSxcbiAgICBjbGkgPSBmYWxzZVxuICB9KSB7XG4gICAgY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gZXM2VGVtcGxhdGVzID8gZXM2VGVtcGxhdGUgOiBlczVUZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGVQYXRoID8gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0Zi04JykgOiBkZWZhdWx0VGVtcGxhdGU7XG4gICAgdGhpcy5taWdyYXRpb25QYXRoID0gcGF0aC5yZXNvbHZlKG1pZ3JhdGlvbnNQYXRoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBtb25nb29zZS5jcmVhdGVDb25uZWN0aW9uKGRiQ29ubmVjdGlvblVyaSk7XG4gICAgdGhpcy5lczYgPSBlczZUZW1wbGF0ZXM7XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvbk5hbWU7XG4gICAgdGhpcy5hdXRvc3luYyA9IGF1dG9zeW5jO1xuICAgIHRoaXMuY2xpID0gY2xpO1xuICAgIE1pZ3JhdGlvbk1vZGVsID0gTWlncmF0aW9uTW9kZWxGYWN0b3J5KGNvbGxlY3Rpb25OYW1lLCB0aGlzLmNvbm5lY3Rpb24pO1xuICB9XG5cbiAgbG9nKGxvZ1N0cmluZywgZm9yY2UgPSBmYWxzZSkge1xuICAgIGlmIChmb3JjZSB8fCB0aGlzLmNsaSkge1xuICAgICAgY29uc29sZS5sb2cobG9nU3RyaW5nKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uID8gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCkgOiBudWxsO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKG1pZ3JhdGlvbk5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXhpc3RpbmdNaWdyYXRpb24gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHsgbmFtZTogbWlncmF0aW9uTmFtZSB9KTtcbiAgICAgIGlmICghIWV4aXN0aW5nTWlncmF0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUgaXMgYWxyZWFkeSBhIG1pZ3JhdGlvbiB3aXRoIG5hbWUgJyR7bWlncmF0aW9uTmFtZX0nIGluIHRoZSBkYXRhYmFzZWAucmVkKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgbmV3TWlncmF0aW9uRmlsZSA9IGAke25vd30tJHttaWdyYXRpb25OYW1lfS5qc2A7XG4gICAgICBta2RpcnAuc3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBuZXdNaWdyYXRpb25GaWxlKSwgdGhpcy50ZW1wbGF0ZSk7XG4gICAgICAvLyBjcmVhdGUgaW5zdGFuY2UgaW4gZGJcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkNyZWF0ZWQgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICBjcmVhdGVkQXQ6IG5vd1xuICAgICAgfSk7XG4gICAgICB0aGlzLmxvZyhgQ3JlYXRlZCBtaWdyYXRpb24gJHttaWdyYXRpb25OYW1lfSBpbiAke3RoaXMubWlncmF0aW9uUGF0aH0uYCk7XG4gICAgICByZXR1cm4gbWlncmF0aW9uQ3JlYXRlZDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coZXJyb3Iuc3RhY2spO1xuICAgICAgZmlsZVJlcXVpcmVkKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBtaWdyYXRpb25zIHVwIHRvIG9yIGRvd24gdG8gYSBnaXZlbiBtaWdyYXRpb24gbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gbWlncmF0aW9uTmFtZVxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXG4gICAqL1xuICBhc3luYyBydW4oZGlyZWN0aW9uID0gJ3VwJywgbWlncmF0aW9uTmFtZSkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuXG4gICAgY29uc3QgdW50aWxNaWdyYXRpb24gPSBtaWdyYXRpb25OYW1lXG4gICAgICA/IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoeyBuYW1lOiBtaWdyYXRpb25OYW1lIH0pXG4gICAgICA6IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoKS5zb3J0KHsgY3JlYXRlZEF0OiAtMSB9KTtcblxuICAgIGlmICghdW50aWxNaWdyYXRpb24pIHtcbiAgICAgIGlmIChtaWdyYXRpb25OYW1lKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoYXQgbWlncmF0aW9uIGluIHRoZSBkYXRhYmFzZScpO1xuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGFyZSBubyBwZW5kaW5nIG1pZ3JhdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgbGV0IHF1ZXJ5ID0ge1xuICAgICAgY3JlYXRlZEF0OiB7ICRsdGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdCB9LFxuICAgICAgc3RhdGU6ICdkb3duJ1xuICAgIH07XG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICdkb3duJykge1xuICAgICAgcXVlcnkgPSB7XG4gICAgICAgIGNyZWF0ZWRBdDogeyAkZ3RlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXQgfSxcbiAgICAgICAgc3RhdGU6ICd1cCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydERpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSAndXAnID8gMSA6IC0xO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQocXVlcnkpLnNvcnQoeyBjcmVhdGVkQXQ6IHNvcnREaXJlY3Rpb24gfSk7XG5cbiAgICBpZiAoIW1pZ3JhdGlvbnNUb1J1bi5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmNsaSkge1xuICAgICAgICB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJy55ZWxsb3cpO1xuICAgICAgICB0aGlzLmxvZyhgQ3VycmVudCBNaWdyYXRpb25zJyBTdGF0dXNlczogYCk7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdCgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nKTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IG51bU1pZ3JhdGlvbnNSYW4gPSAwO1xuICAgIGxldCBtaWdyYXRpb25zUmFuID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1pZ3JhdGlvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkZpbGVQYXRoID0gcGF0aC5qb2luKHNlbGYubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uLmZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsICdub2RlX21vZHVsZXMnKTtcbiAgICAgIGxldCBjb2RlID0gZnMucmVhZEZpbGVTeW5jKG1pZ3JhdGlvbkZpbGVQYXRoKTtcbiAgICAgIGlmICh0aGlzLmVzNikge1xuICAgICAgICByZXF1aXJlKCdiYWJlbC1yZWdpc3RlcicpKHtcbiAgICAgICAgICBwcmVzZXRzOiBbcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWxhdGVzdCcpXSxcbiAgICAgICAgICBwbHVnaW5zOiBbcmVxdWlyZSgnYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1ydW50aW1lJyldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXBvbHlmaWxsJyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBtaWdyYXRpb25GdW5jdGlvbnM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1pZ3JhdGlvbkZ1bmN0aW9ucyA9IHJlcXVpcmUobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGVyci5tZXNzYWdlID1cbiAgICAgICAgICBlcnIubWVzc2FnZSAmJiAvVW5leHBlY3RlZCB0b2tlbi8udGVzdChlcnIubWVzc2FnZSlcbiAgICAgICAgICAgID8gJ1VuZXhwZWN0ZWQgVG9rZW4gd2hlbiBwYXJzaW5nIG1pZ3JhdGlvbi4gSWYgeW91IGFyZSB1c2luZyBhbiBFUzYgbWlncmF0aW9uIGZpbGUsIHVzZSBvcHRpb24gLS1lczYnXG4gICAgICAgICAgICA6IGVyci5tZXNzYWdlO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIGlmICghbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJHtkaXJlY3Rpb259IGV4cG9ydCBpcyBub3QgZGVmaW5lZCBpbiAke21pZ3JhdGlvbi5maWxlbmFtZX0uYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBhd2FpdCBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyAgIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgIC8vICAgICB0aGlzLmNvbm5lY3Rpb24ubW9kZWwuYmluZCh0aGlzLmNvbm5lY3Rpb24pLFxuICAgICAgICAvLyAgICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICAgIC8vICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgLy8gICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgICk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgaWYgKGNhbGxQcm9taXNlICYmIHR5cGVvZiBjYWxsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICAgICBjYWxsUHJvbWlzZS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBjb25zdCBjYWxsUHJvbWlzZSA9ICBtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXS5jYWxsKFxuICAgICAgICAvLyAgIHRoaXMuY29ubmVjdGlvbi5tb2RlbC5iaW5kKHRoaXMuY29ubmVjdGlvbiksXG4gICAgICAgIC8vICAgZXJyID0+IHtcbiAgICAgICAgLy8gICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgLy8gICAgIHJlc29sdmUoKTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vICk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIChjYWxsUHJvbWlzZSAmJiB0eXBlb2YgY2FsbFByb21pc2UudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAgIGF3YWl0IGNhbGxQcm9taXNlXG4gICAgICAgIC8vIH1cblxuICAgICAgICBjb25zdCBjYWxsUHJvbWlzZSA9IG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dO1xuICAgICAgICBjYWxsUHJvbWlzZS5iaW5kKHRoaXMuY29ubmVjdGlvbi5tb2RlbC5iaW5kKHRoaXMuY29ubmVjdGlvbikpO1xuICAgICAgICBhd2FpdCBjYWxsUHJvbWlzZSgpO1xuXG4gICAgICAgIHRoaXMubG9nKGAke2RpcmVjdGlvbi50b1VwcGVyQ2FzZSgpfTogICBgW2RpcmVjdGlvbiA9PSAndXAnID8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttaWdyYXRpb24uZmlsZW5hbWV9IGApO1xuXG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLndoZXJlKHsgbmFtZTogbWlncmF0aW9uLm5hbWUgfSkudXBkYXRlKHsgJHNldDogeyBzdGF0ZTogZGlyZWN0aW9uIH0gfSk7XG4gICAgICAgIG1pZ3JhdGlvbnNSYW4ucHVzaChtaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgICBudW1NaWdyYXRpb25zUmFuKys7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB0aGlzLmxvZyhgRmFpbGVkIHRvIHJ1biBtaWdyYXRpb24gJHttaWdyYXRpb24ubmFtZX0gZHVlIHRvIGFuIGVycm9yLmAucmVkKTtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBjb250aW51aW5nLiBNYWtlIHN1cmUgeW91ciBkYXRhIGlzIGluIGNvbnNpc3RlbnQgc3RhdGVgLnJlZCk7XG4gICAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pZ3JhdGlvbnNUb1J1bi5sZW5ndGggPT0gbnVtTWlncmF0aW9uc1JhbikgdGhpcy5sb2coJ0FsbCBtaWdyYXRpb25zIGZpbmlzaGVkIHN1Y2Nlc3NmdWxseS4nLmdyZWVuKTtcbiAgICByZXR1cm4gbWlncmF0aW9uc1JhbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rcyBhdCB0aGUgZmlsZSBzeXN0ZW0gbWlncmF0aW9ucyBhbmQgaW1wb3J0cyBhbnkgbWlncmF0aW9ucyB0aGF0IGFyZVxuICAgKiBvbiB0aGUgZmlsZSBzeXN0ZW0gYnV0IG1pc3NpbmcgaW4gdGhlIGRhdGFiYXNlIGludG8gdGhlIGRhdGFiYXNlXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvcHBvc2l0ZSBvZiBwcnVuZSgpXG4gICAqL1xuICBhc3luYyBzeW5jKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcyQvLnRlc3QoZmlsZSkpLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBtLmZpbGVuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgY3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZpbGVzTm90SW5EYiA9IF8uZmlsdGVyKG1pZ3JhdGlvbnNJbkZvbGRlciwgeyBleGlzdHNJbkRhdGFiYXNlOiBmYWxzZSB9KS5tYXAoZiA9PiBmLmZpbGVuYW1lKTtcbiAgICAgIGxldCBtaWdyYXRpb25zVG9JbXBvcnQgPSBmaWxlc05vdEluRGI7XG4gICAgICB0aGlzLmxvZygnU3luY2hyb25pemluZyBkYXRhYmFzZSB3aXRoIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMuLi4nKTtcbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiBtaWdyYXRpb25zVG9JbXBvcnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlciBidXQgbm90IGluIHRoZSBkYXRhYmFzZS4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIGltcG9ydCBpbnRvIHRoZSBkYXRhYmFzZScsXG4gICAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9JbXBvcnQnLFxuICAgICAgICAgICAgICBjaG9pY2VzOiBmaWxlc05vdEluRGJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbnN3ZXJzID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBtaWdyYXRpb25zVG9JbXBvcnQgPSBhbnN3ZXJzLm1pZ3JhdGlvbnNUb0ltcG9ydDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UubWFwKG1pZ3JhdGlvbnNUb0ltcG9ydCwgbWlncmF0aW9uVG9JbXBvcnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvblRvSW1wb3J0KSxcbiAgICAgICAgICB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCA9IG1pZ3JhdGlvblRvSW1wb3J0LmluZGV4T2YoJy0nKSxcbiAgICAgICAgICB0aW1lc3RhbXAgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSgwLCB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCksXG4gICAgICAgICAgbWlncmF0aW9uTmFtZSA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ICsgMSwgbWlncmF0aW9uVG9JbXBvcnQubGFzdEluZGV4T2YoJy4nKSk7XG5cbiAgICAgICAgdGhpcy5sb2coYEFkZGluZyBtaWdyYXRpb24gJHtmaWxlUGF0aH0gaW50byBkYXRhYmFzZSBmcm9tIGZpbGUgc3lzdGVtLiBTdGF0ZSBpcyBgICsgYERPV05gLnJlZCk7XG4gICAgICAgIHJldHVybiBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcbiAgICAgICAgfSkudGhlbihjcmVhdGVkTWlncmF0aW9uID0+IGNyZWF0ZWRNaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3Qgc3luY2hyb25pc2UgbWlncmF0aW9ucyBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgdXAgdG8gdGhlIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcHBvc2l0ZSBvZiBzeW5jKCkuXG4gICAqIFJlbW92ZXMgZmlsZXMgaW4gbWlncmF0aW9uIGRpcmVjdG9yeSB3aGljaCBkb24ndCBleGlzdCBpbiBkYXRhYmFzZS5cbiAgICovXG4gIGFzeW5jIHBydW5lKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSkubGVhbigpO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMvLnRlc3QoZmlsZSkpLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9ICEhXy5maW5kKG1pZ3JhdGlvbnNJbkRhdGFiYXNlLCB7IGNyZWF0ZWRBdDogbmV3IERhdGUoZmlsZUNyZWF0ZWRBdCkgfSk7XG4gICAgICAgIHJldHVybiB7IGNyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsIGV4aXN0c0luRGF0YWJhc2UgfTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYk1pZ3JhdGlvbnNOb3RPbkZzID0gXy5maWx0ZXIobWlncmF0aW9uc0luRGF0YWJhc2UsIG0gPT4ge1xuICAgICAgICByZXR1cm4gIV8uZmluZChtaWdyYXRpb25zSW5Gb2xkZXIsIHsgZmlsZW5hbWU6IG0uZmlsZW5hbWUgfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGRiTWlncmF0aW9uc05vdE9uRnMubWFwKG0gPT4gbS5uYW1lKTtcblxuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmICEhbWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgZGF0YWJhc2UgYnV0IG5vdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byByZW1vdmUgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uJyxcbiAgICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0RlbGV0ZScsXG4gICAgICAgICAgICAgIGNob2ljZXM6IG1pZ3JhdGlvbnNUb0RlbGV0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuc3dlcnMgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKGFuc3dlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGFuc3dlcnMubWlncmF0aW9uc1RvRGVsZXRlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaWdyYXRpb25zVG9EZWxldGVEb2NzID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7XG4gICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgfSkubGVhbigpO1xuXG4gICAgICBpZiAobWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmxvZyhgUmVtb3ZpbmcgbWlncmF0aW9uKHMpIGAsIGAke21pZ3JhdGlvbnNUb0RlbGV0ZS5qb2luKCcsICcpfWAuY3lhbiwgYCBmcm9tIGRhdGFiYXNlYCk7XG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLnJlbW92ZSh7XG4gICAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWlncmF0aW9uc1RvRGVsZXRlRG9jcztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBwcnVuZSBleHRyYW5lb3VzIG1pZ3JhdGlvbnMgZnJvbSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIGN1cnJlbnQgbWlncmF0aW9ucyBhbmQgdGhlaXIgc3RhdHVzZXNcbiAgICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8T2JqZWN0Pj59XG4gICAqIEBleGFtcGxlXG4gICAqICAgW1xuICAgKiAgICB7IG5hbWU6ICdteS1taWdyYXRpb24nLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQyNF9teS1taWdyYXRpb24uanMnLCBzdGF0ZTogJ3VwJyB9LFxuICAgKiAgICB7IG5hbWU6ICdhZGQtY293cycsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDUzX2FkZC1jb3dzLmpzJywgc3RhdGU6ICdkb3duJyB9XG4gICAqICAgXVxuICAgKi9cbiAgYXN5bmMgbGlzdCgpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICBjb25zdCBtaWdyYXRpb25zID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCgpLnNvcnQoeyBjcmVhdGVkQXQ6IDEgfSk7XG4gICAgaWYgKCFtaWdyYXRpb25zLmxlbmd0aCkgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIGxpc3QuJy55ZWxsb3cpO1xuICAgIHJldHVybiBtaWdyYXRpb25zLm1hcChtID0+IHtcbiAgICAgIHRoaXMubG9nKGAke20uc3RhdGUgPT0gJ3VwJyA/ICdVUDogIFxcdCcgOiAnRE9XTjpcXHQnfWBbbS5zdGF0ZSA9PSAndXAnID8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttLmZpbGVuYW1lfWApO1xuICAgICAgcmV0dXJuIG0udG9KU09OKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmlsZVJlcXVpcmVkKGVycm9yKSB7XG4gIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09ICdFTk9FTlQnKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBDb3VsZCBub3QgZmluZCBhbnkgZmlsZXMgYXQgcGF0aCAnJHtlcnJvci5wYXRofSdgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1pZ3JhdG9yO1xuIl19