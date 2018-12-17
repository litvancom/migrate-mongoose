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
  warnings: false
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
        cli = _ref$cli === undefined ? false : _ref$cli,
        connection = _ref.connection;
    (0, _classCallCheck3.default)(this, Migrator);

    var defaultTemplate = es6Templates ? es6Template : es5Template;
    this.template = templatePath ? _fs2.default.readFileSync(templatePath, 'utf-8') : defaultTemplate;
    this.migrationPath = _path2.default.resolve(migrationsPath);
    this.connection = connection || _mongoose2.default.createConnection(dbConnectionUri);
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

    /**
     * Use your own Mongoose connection object (so you can use this('modelname')
     * @param {mongoose.connection} connection - Mongoose connection
     */

  }, {
    key: 'setMongooseConnection',
    value: function setMongooseConnection(connection) {
      MigrationModel = (0, _db2.default)(this.collection, connection);
    }

    /**
     * Close the underlying connection to mongo
     * @returns {Promise} A promise that resolves when connection is closed
     */

  }, {
    key: 'close',
    value: function close() {
      return this.connection ? this.connection.close() : _bluebird2.default.resolve();
    }

    /**
     * Create a new migration
     * @param {string} migrationName
     * @returns {Promise<Object>} A promise of the Migration created
     */

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

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration, migrationFilePath, migrationFunctions, callPromise;

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
                  _context2.next = 73;
                  break;
                }

                migration = _step.value;
                migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);

                if (this.es6) {
                  require('babel-register')({
                    presets: [require('babel-preset-latest')],
                    plugins: [require('babel-plugin-transform-runtime')]
                  });

                  require('babel-polyfill');
                }

                migrationFunctions = void 0;
                _context2.prev = 44;

                migrationFunctions = require(migrationFilePath);
                _context2.next = 52;
                break;

              case 48:
                _context2.prev = 48;
                _context2.t1 = _context2['catch'](44);

                _context2.t1.message = _context2.t1.message && /Unexpected token/.test(_context2.t1.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t1.message;
                throw _context2.t1;

              case 52:
                if (migrationFunctions[direction]) {
                  _context2.next = 54;
                  break;
                }

                throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

              case 54:
                _context2.prev = 54;

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

                callPromise = migrationFunctions[direction].call(this.connection.model.bind(this.connection), function callback(err) {
                  if (err) return reject(err);
                  resolve();
                });
                _context2.next = 58;
                return callPromise;

              case 58:

                this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                _context2.next = 61;
                return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

              case 61:
                migrationsRan.push(migration.toJSON());
                numMigrationsRan++;
                _context2.next = 70;
                break;

              case 65:
                _context2.prev = 65;
                _context2.t2 = _context2['catch'](54);

                this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                this.log('Not continuing. Make sure your data is in consistent state'.red);
                throw _context2.t2 instanceof Error ? _context2.t2 : new Error(_context2.t2);

              case 70:
                _iteratorNormalCompletion = true;
                _context2.next = 39;
                break;

              case 73:
                _context2.next = 79;
                break;

              case 75:
                _context2.prev = 75;
                _context2.t3 = _context2['catch'](37);
                _didIteratorError = true;
                _iteratorError = _context2.t3;

              case 79:
                _context2.prev = 79;
                _context2.prev = 80;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 82:
                _context2.prev = 82;

                if (!_didIteratorError) {
                  _context2.next = 85;
                  break;
                }

                throw _iteratorError;

              case 85:
                return _context2.finish(82);

              case 86:
                return _context2.finish(79);

              case 87:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context2.abrupt('return', migrationsRan);

              case 89:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[37, 75, 79, 87], [44, 48], [54, 65], [80,, 82, 86]]);
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
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var _this = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context4.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context4.sent;

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
                  _context4.next = 14;
                  break;
                }

                _context4.next = 12;
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
                answers = _context4.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context4.abrupt('return', _bluebird2.default.map(migrationsToImport, function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(migrationToImport) {
                    var filePath, timestampSeparatorIndex, timestamp, migrationName, createdMigration;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            filePath = _path2.default.join(_this.migrationPath, migrationToImport), timestampSeparatorIndex = migrationToImport.indexOf('-'), timestamp = migrationToImport.slice(0, timestampSeparatorIndex), migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));


                            _this.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                            _context3.next = 4;
                            return MigrationModel.create({
                              name: migrationName,
                              createdAt: timestamp
                            });

                          case 4:
                            createdMigration = _context3.sent;
                            return _context3.abrupt('return', createdMigration.toJSON());

                          case 6:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this);
                  }));

                  return function (_x4) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 17:
                _context4.prev = 17;
                _context4.t0 = _context4['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context4.t0;

              case 21:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 17]]);
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
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, dbMigrationsNotOnFs, migrationsToDelete, answers, migrationsToDeleteDocs;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context5.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context5.sent;

                // Go over migrations in folder and delete any files not in DB
                migrationsInFolder = _lodash2.default.filter(filesInMigrationFolder, function (file) {
                  return (/\d{13,}\-.+.js/.test(file)
                  );
                }).map(function (filename) {
                  var fileCreatedAt = parseInt(filename.split('-')[0]);
                  var existsInDatabase = migrationsInDatabase.some(function (m) {
                    return filename == m.filename;
                  });
                  return { createdAt: fileCreatedAt, filename: filename, existsInDatabase: existsInDatabase };
                });
                dbMigrationsNotOnFs = _lodash2.default.filter(migrationsInDatabase, function (m) {
                  return !_lodash2.default.find(migrationsInFolder, { filename: m.filename });
                });
                migrationsToDelete = dbMigrationsNotOnFs.map(function (m) {
                  return m.name;
                });

                if (!(!this.autosync && !!migrationsToDelete.length)) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 11;
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
                answers = _context5.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context5.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context5.sent;

                if (!migrationsToDelete.length) {
                  _context5.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context5.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context5.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context5.prev = 23;
                _context5.t0 = _context5['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context5.t0;

              case 27:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 23]]);
      }));

      function prune() {
        return _ref6.apply(this, arguments);
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
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var _this2 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.sync();

              case 2:
                _context6.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context6.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context6.abrupt('return', migrations.map(function (m) {
                  _this2.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function list() {
        return _ref7.apply(this, arguments);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJQcm9taXNlIiwiY29uZmlnIiwid2FybmluZ3MiLCJtb25nb29zZSIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImNvbm5lY3Rpb24iLCJkZWZhdWx0VGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsImZzIiwicmVhZEZpbGVTeW5jIiwibWlncmF0aW9uUGF0aCIsInBhdGgiLCJyZXNvbHZlIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJta2RpcnAiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsInJlcXVpcmUiLCJwcmVzZXRzIiwicGx1Z2lucyIsIm1pZ3JhdGlvbkZ1bmN0aW9ucyIsIm1lc3NhZ2UiLCJ0ZXN0IiwiY2FsbFByb21pc2UiLCJjYWxsIiwibW9kZWwiLCJiaW5kIiwiY2FsbGJhY2siLCJlcnIiLCJyZWplY3QiLCJ0b1VwcGVyQ2FzZSIsIndoZXJlIiwidXBkYXRlIiwiJHNldCIsInB1c2giLCJ0b0pTT04iLCJncmVlbiIsImZpbGVzSW5NaWdyYXRpb25Gb2xkZXIiLCJyZWFkZGlyU3luYyIsIm1pZ3JhdGlvbnNJbkRhdGFiYXNlIiwibWlncmF0aW9uc0luRm9sZGVyIiwiXyIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJzb21lIiwibSIsImZpbGVzTm90SW5EYiIsImYiLCJtaWdyYXRpb25zVG9JbXBvcnQiLCJhc2siLCJwcm9tcHQiLCJ0eXBlIiwiY2hvaWNlcyIsImFuc3dlcnMiLCJtaWdyYXRpb25Ub0ltcG9ydCIsImZpbGVQYXRoIiwidGltZXN0YW1wU2VwYXJhdG9ySW5kZXgiLCJpbmRleE9mIiwidGltZXN0YW1wIiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsImNyZWF0ZWRNaWdyYXRpb24iLCJkYk1pZ3JhdGlvbnNOb3RPbkZzIiwibWlncmF0aW9uc1RvRGVsZXRlIiwiJGluIiwibGVhbiIsIm1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MiLCJjeWFuIiwicmVtb3ZlIiwibWlncmF0aW9ucyIsImVycm9yIiwiY29kZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBQ0EsSUFBSUEsdUJBQUo7O0FBRUFDLG1CQUFRQyxNQUFSLENBQWU7QUFDYkMsWUFBVTtBQURHLENBQWY7O0FBSUFDLG1CQUFTSCxPQUFULEdBQW1CQSxrQkFBbkI7O0FBRUEsSUFBTUksOFNBQU47O0FBZ0JB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QUFXOUIsR0FBWCxDQUFlLGFBQUs7QUFDekIseUJBQUtuRSxHQUFMLENBQVMsT0FBR3lFLEVBQUUvQyxLQUFGLElBQVcsSUFBWCxHQUFrQixTQUFsQixHQUE4QixTQUFqQyxHQUE2QytDLEVBQUUvQyxLQUFGLElBQVcsSUFBWCxHQUFrQixPQUFsQixHQUE0QixLQUF6RSxXQUFzRitDLEVBQUVsQyxRQUF4RixDQUFUO0FBQ0EseUJBQU9rQyxFQUFFZixNQUFGLEVBQVA7QUFDRCxpQkFITSxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkEzVFVoRixROzs7QUFrVXJCLFNBQVN5QyxZQUFULENBQXNCK0UsS0FBdEIsRUFBNkI7QUFDM0IsTUFBSUEsU0FBU0EsTUFBTUMsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSTVFLGNBQUoseUNBQXdEMkUsTUFBTTFHLElBQTlELFFBQU47QUFDRDtBQUNGOztBQUVENEcsT0FBT0MsT0FBUCxHQUFpQjNILFFBQWpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAnY29sb3JzJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGFzayBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCBNaWdyYXRpb25Nb2RlbEZhY3RvcnkgZnJvbSAnLi9kYic7XG5sZXQgTWlncmF0aW9uTW9kZWw7XG5cblByb21pc2UuY29uZmlnKHtcbiAgd2FybmluZ3M6IGZhbHNlXG59KTtcblxubW9uZ29vc2UuUHJvbWlzZSA9IFByb21pc2U7XG5cbmNvbnN0IGVzNlRlbXBsYXRlID0gYFxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93biAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5gO1xuXG5jb25zdCBlczVUZW1wbGF0ZSA9IGAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB5b3UgbmVlZCB0byBtYWtlIHRvIHRoZSBkYXRhYmFzZSBoZXJlXG4gKi9cbmV4cG9ydHMudXAgPSBmdW5jdGlvbiB1cCAoZG9uZSkge1xuICBkb25lKCk7XG59O1xuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgdGhhdCBVTkRPIHRoZSB1cCBmdW5jdGlvbiBzaWRlIGVmZmVjdHMgaGVyZSAoaWYgcG9zc2libGUpXG4gKi9cbmV4cG9ydHMuZG93biA9IGZ1bmN0aW9uIGRvd24oZG9uZSkge1xuICBkb25lKCk7XG59O1xuYDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlncmF0b3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdGVtcGxhdGVQYXRoLFxuICAgIG1pZ3JhdGlvbnNQYXRoID0gJy4vbWlncmF0aW9ucycsXG4gICAgZGJDb25uZWN0aW9uVXJpLFxuICAgIGVzNlRlbXBsYXRlcyA9IGZhbHNlLFxuICAgIGNvbGxlY3Rpb25OYW1lID0gJ21pZ3JhdGlvbnMnLFxuICAgIGF1dG9zeW5jID0gZmFsc2UsXG4gICAgY2xpID0gZmFsc2UsXG4gICAgY29ubmVjdGlvblxuICB9KSB7XG4gICAgY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gZXM2VGVtcGxhdGVzID8gZXM2VGVtcGxhdGUgOiBlczVUZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGVQYXRoID8gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0Zi04JykgOiBkZWZhdWx0VGVtcGxhdGU7XG4gICAgdGhpcy5taWdyYXRpb25QYXRoID0gcGF0aC5yZXNvbHZlKG1pZ3JhdGlvbnNQYXRoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uIHx8IG1vbmdvb3NlLmNyZWF0ZUNvbm5lY3Rpb24oZGJDb25uZWN0aW9uVXJpKTtcbiAgICB0aGlzLmVzNiA9IGVzNlRlbXBsYXRlcztcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uTmFtZTtcbiAgICB0aGlzLmF1dG9zeW5jID0gYXV0b3N5bmM7XG4gICAgdGhpcy5jbGkgPSBjbGk7XG4gICAgTWlncmF0aW9uTW9kZWwgPSBNaWdyYXRpb25Nb2RlbEZhY3RvcnkoY29sbGVjdGlvbk5hbWUsIHRoaXMuY29ubmVjdGlvbik7XG4gIH1cblxuICBsb2cobG9nU3RyaW5nLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKGZvcmNlIHx8IHRoaXMuY2xpKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2dTdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgeW91ciBvd24gTW9uZ29vc2UgY29ubmVjdGlvbiBvYmplY3QgKHNvIHlvdSBjYW4gdXNlIHRoaXMoJ21vZGVsbmFtZScpXG4gICAqIEBwYXJhbSB7bW9uZ29vc2UuY29ubmVjdGlvbn0gY29ubmVjdGlvbiAtIE1vbmdvb3NlIGNvbm5lY3Rpb25cbiAgICovXG4gIHNldE1vbmdvb3NlQ29ubmVjdGlvbihjb25uZWN0aW9uKSB7XG4gICAgTWlncmF0aW9uTW9kZWwgPSBNaWdyYXRpb25Nb2RlbEZhY3RvcnkodGhpcy5jb2xsZWN0aW9uLCBjb25uZWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgdW5kZXJseWluZyBjb25uZWN0aW9uIHRvIG1vbmdvXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uID8gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCkgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgbWlncmF0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtaWdyYXRpb25OYW1lXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IEEgcHJvbWlzZSBvZiB0aGUgTWlncmF0aW9uIGNyZWF0ZWRcbiAgICovXG4gIGFzeW5jIGNyZWF0ZShtaWdyYXRpb25OYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTWlncmF0aW9uID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7IG5hbWU6IG1pZ3JhdGlvbk5hbWUgfSk7XG4gICAgICBpZiAoISFleGlzdGluZ01pZ3JhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIGFscmVhZHkgYSBtaWdyYXRpb24gd2l0aCBuYW1lICcke21pZ3JhdGlvbk5hbWV9JyBpbiB0aGUgZGF0YWJhc2VgLnJlZCk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgIGNvbnN0IG5ld01pZ3JhdGlvbkZpbGUgPSBgJHtub3d9LSR7bWlncmF0aW9uTmFtZX0uanNgO1xuICAgICAgbWtkaXJwLnN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHRoaXMubWlncmF0aW9uUGF0aCwgbmV3TWlncmF0aW9uRmlsZSksIHRoaXMudGVtcGxhdGUpO1xuICAgICAgLy8gY3JlYXRlIGluc3RhbmNlIGluIGRiXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICBjb25zdCBtaWdyYXRpb25DcmVhdGVkID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogbWlncmF0aW9uTmFtZSxcbiAgICAgICAgY3JlYXRlZEF0OiBub3dcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2coYENyZWF0ZWQgbWlncmF0aW9uICR7bWlncmF0aW9uTmFtZX0gaW4gJHt0aGlzLm1pZ3JhdGlvblBhdGh9LmApO1xuICAgICAgcmV0dXJuIG1pZ3JhdGlvbkNyZWF0ZWQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGVycm9yLnN0YWNrKTtcbiAgICAgIGZpbGVSZXF1aXJlZChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgbWlncmF0aW9ucyB1cCB0byBvciBkb3duIHRvIGEgZ2l2ZW4gbWlncmF0aW9uIG5hbWVcbiAgICpcbiAgICogQHBhcmFtIG1pZ3JhdGlvbk5hbWVcbiAgICogQHBhcmFtIGRpcmVjdGlvblxuICAgKi9cbiAgYXN5bmMgcnVuKGRpcmVjdGlvbiA9ICd1cCcsIG1pZ3JhdGlvbk5hbWUpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcblxuICAgIGNvbnN0IHVudGlsTWlncmF0aW9uID0gbWlncmF0aW9uTmFtZVxuICAgICAgPyBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHsgbmFtZTogbWlncmF0aW9uTmFtZSB9KVxuICAgICAgOiBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKCkuc29ydCh7IGNyZWF0ZWRBdDogLTEgfSk7XG5cbiAgICBpZiAoIXVudGlsTWlncmF0aW9uKSB7XG4gICAgICBpZiAobWlncmF0aW9uTmFtZSkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdDb3VsZCBub3QgZmluZCB0aGF0IG1pZ3JhdGlvbiBpbiB0aGUgZGF0YWJhc2UnKTtcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgbm8gcGVuZGluZyBtaWdyYXRpb25zLicpO1xuICAgIH1cblxuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNyZWF0ZWRBdDogeyAkbHRlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXQgfSxcbiAgICAgIHN0YXRlOiAnZG93bidcbiAgICB9O1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PSAnZG93bicpIHtcbiAgICAgIHF1ZXJ5ID0ge1xuICAgICAgICBjcmVhdGVkQXQ6IHsgJGd0ZTogdW50aWxNaWdyYXRpb24uY3JlYXRlZEF0IH0sXG4gICAgICAgIHN0YXRlOiAndXAnXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHNvcnREaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT0gJ3VwJyA/IDEgOiAtMTtcbiAgICBjb25zdCBtaWdyYXRpb25zVG9SdW4gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHF1ZXJ5KS5zb3J0KHsgY3JlYXRlZEF0OiBzb3J0RGlyZWN0aW9uIH0pO1xuXG4gICAgaWYgKCFtaWdyYXRpb25zVG9SdW4ubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5jbGkpIHtcbiAgICAgICAgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIHJ1bicueWVsbG93KTtcbiAgICAgICAgdGhpcy5sb2coYEN1cnJlbnQgTWlncmF0aW9ucycgU3RhdHVzZXM6IGApO1xuICAgICAgICBhd2FpdCB0aGlzLmxpc3QoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJyk7XG4gICAgfVxuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBudW1NaWdyYXRpb25zUmFuID0gMDtcbiAgICBsZXQgbWlncmF0aW9uc1JhbiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBtaWdyYXRpb24gb2YgbWlncmF0aW9uc1RvUnVuKSB7XG4gICAgICBjb25zdCBtaWdyYXRpb25GaWxlUGF0aCA9IHBhdGguam9pbihzZWxmLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvbi5maWxlbmFtZSk7XG4gICAgICBpZiAodGhpcy5lczYpIHtcbiAgICAgICAgcmVxdWlyZSgnYmFiZWwtcmVnaXN0ZXInKSh7XG4gICAgICAgICAgcHJlc2V0czogW3JlcXVpcmUoJ2JhYmVsLXByZXNldC1sYXRlc3QnKV0sXG4gICAgICAgICAgcGx1Z2luczogW3JlcXVpcmUoJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0tcnVudGltZScpXVxuICAgICAgICB9KTtcblxuICAgICAgICByZXF1aXJlKCdiYWJlbC1wb2x5ZmlsbCcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgbWlncmF0aW9uRnVuY3Rpb25zO1xuXG4gICAgICB0cnkge1xuICAgICAgICBtaWdyYXRpb25GdW5jdGlvbnMgPSByZXF1aXJlKG1pZ3JhdGlvbkZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBlcnIubWVzc2FnZSA9XG4gICAgICAgICAgZXJyLm1lc3NhZ2UgJiYgL1VuZXhwZWN0ZWQgdG9rZW4vLnRlc3QoZXJyLm1lc3NhZ2UpXG4gICAgICAgICAgICA/ICdVbmV4cGVjdGVkIFRva2VuIHdoZW4gcGFyc2luZyBtaWdyYXRpb24uIElmIHlvdSBhcmUgdXNpbmcgYW4gRVM2IG1pZ3JhdGlvbiBmaWxlLCB1c2Ugb3B0aW9uIC0tZXM2J1xuICAgICAgICAgICAgOiBlcnIubWVzc2FnZTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlICR7ZGlyZWN0aW9ufSBleHBvcnQgaXMgbm90IGRlZmluZWQgaW4gJHttaWdyYXRpb24uZmlsZW5hbWV9LmAucmVkKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gYXdhaXQgbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gICBjb25zdCBjYWxsUHJvbWlzZSA9ICBtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXS5jYWxsKFxuICAgICAgICAvLyAgICAgdGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSxcbiAgICAgICAgLy8gICAgIGZ1bmN0aW9uIGNhbGxiYWNrKGVycikge1xuICAgICAgICAvLyAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIC8vICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICApO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGlmIChjYWxsUHJvbWlzZSAmJiB0eXBlb2YgY2FsbFByb21pc2UudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAgICAgY2FsbFByb21pc2UudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgY29uc3QgY2FsbFByb21pc2UgPSBtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXS5jYWxsKHRoaXMuY29ubmVjdGlvbi5tb2RlbC5iaW5kKHRoaXMuY29ubmVjdGlvbiksIGZ1bmN0aW9uIGNhbGxiYWNrKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF3YWl0IGNhbGxQcm9taXNlO1xuXG4gICAgICAgIHRoaXMubG9nKGAke2RpcmVjdGlvbi50b1VwcGVyQ2FzZSgpfTogICBgW2RpcmVjdGlvbiA9PSAndXAnID8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttaWdyYXRpb24uZmlsZW5hbWV9IGApO1xuXG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLndoZXJlKHsgbmFtZTogbWlncmF0aW9uLm5hbWUgfSkudXBkYXRlKHsgJHNldDogeyBzdGF0ZTogZGlyZWN0aW9uIH0gfSk7XG4gICAgICAgIG1pZ3JhdGlvbnNSYW4ucHVzaChtaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgICBudW1NaWdyYXRpb25zUmFuKys7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2coYEZhaWxlZCB0byBydW4gbWlncmF0aW9uICR7bWlncmF0aW9uLm5hbWV9IGR1ZSB0byBhbiBlcnJvci5gLnJlZCk7XG4gICAgICAgIHRoaXMubG9nKGBOb3QgY29udGludWluZy4gTWFrZSBzdXJlIHlvdXIgZGF0YSBpcyBpbiBjb25zaXN0ZW50IHN0YXRlYC5yZWQpO1xuICAgICAgICB0aHJvdyBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtaWdyYXRpb25zVG9SdW4ubGVuZ3RoID09IG51bU1pZ3JhdGlvbnNSYW4pIHRoaXMubG9nKCdBbGwgbWlncmF0aW9ucyBmaW5pc2hlZCBzdWNjZXNzZnVsbHkuJy5ncmVlbik7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnNSYW47XG4gIH1cblxuICAvKipcbiAgICogTG9va3MgYXQgdGhlIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMgYW5kIGltcG9ydHMgYW55IG1pZ3JhdGlvbnMgdGhhdCBhcmVcbiAgICogb24gdGhlIGZpbGUgc3lzdGVtIGJ1dCBtaXNzaW5nIGluIHRoZSBkYXRhYmFzZSBpbnRvIHRoZSBkYXRhYmFzZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgb3Bwb3NpdGUgb2YgcHJ1bmUoKVxuICAgKi9cbiAgYXN5bmMgc3luYygpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMkLy50ZXN0KGZpbGUpKS5tYXAoZmlsZW5hbWUgPT4ge1xuICAgICAgICBjb25zdCBmaWxlQ3JlYXRlZEF0ID0gcGFyc2VJbnQoZmlsZW5hbWUuc3BsaXQoJy0nKVswXSk7XG4gICAgICAgIGNvbnN0IGV4aXN0c0luRGF0YWJhc2UgPSBtaWdyYXRpb25zSW5EYXRhYmFzZS5zb21lKG0gPT4gZmlsZW5hbWUgPT0gbS5maWxlbmFtZSk7XG4gICAgICAgIHJldHVybiB7IGNyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsIGV4aXN0c0luRGF0YWJhc2UgfTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBmaWxlc05vdEluRGIgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5Gb2xkZXIsIHsgZXhpc3RzSW5EYXRhYmFzZTogZmFsc2UgfSkubWFwKGYgPT4gZi5maWxlbmFtZSk7XG4gICAgICBsZXQgbWlncmF0aW9uc1RvSW1wb3J0ID0gZmlsZXNOb3RJbkRiO1xuICAgICAgdGhpcy5sb2coJ1N5bmNocm9uaXppbmcgZGF0YWJhc2Ugd2l0aCBmaWxlIHN5c3RlbSBtaWdyYXRpb25zLi4uJyk7XG4gICAgICBpZiAoIXRoaXMuYXV0b3N5bmMgJiYgbWlncmF0aW9uc1RvSW1wb3J0Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgYnV0IG5vdCBpbiB0aGUgZGF0YWJhc2UuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byBpbXBvcnQgaW50byB0aGUgZGF0YWJhc2UnLFxuICAgICAgICAgICAgICBuYW1lOiAnbWlncmF0aW9uc1RvSW1wb3J0JyxcbiAgICAgICAgICAgICAgY2hvaWNlczogZmlsZXNOb3RJbkRiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5zd2VycyA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvSW1wb3J0ID0gYW5zd2Vycy5taWdyYXRpb25zVG9JbXBvcnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLm1hcChtaWdyYXRpb25zVG9JbXBvcnQsIGFzeW5jIG1pZ3JhdGlvblRvSW1wb3J0ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBtaWdyYXRpb25Ub0ltcG9ydCksXG4gICAgICAgICAgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXggPSBtaWdyYXRpb25Ub0ltcG9ydC5pbmRleE9mKCctJyksXG4gICAgICAgICAgdGltZXN0YW1wID0gbWlncmF0aW9uVG9JbXBvcnQuc2xpY2UoMCwgdGltZXN0YW1wU2VwYXJhdG9ySW5kZXgpLFxuICAgICAgICAgIG1pZ3JhdGlvbk5hbWUgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSh0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCArIDEsIG1pZ3JhdGlvblRvSW1wb3J0Lmxhc3RJbmRleE9mKCcuJykpO1xuXG4gICAgICAgIHRoaXMubG9nKGBBZGRpbmcgbWlncmF0aW9uICR7ZmlsZVBhdGh9IGludG8gZGF0YWJhc2UgZnJvbSBmaWxlIHN5c3RlbS4gU3RhdGUgaXMgYCArIGBET1dOYC5yZWQpO1xuICAgICAgICBjb25zdCBjcmVhdGVkTWlncmF0aW9uID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuY3JlYXRlKHtcbiAgICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICAgIGNyZWF0ZWRBdDogdGltZXN0YW1wXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY3JlYXRlZE1pZ3JhdGlvbi50b0pTT04oKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHN5bmNocm9uaXNlIG1pZ3JhdGlvbnMgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIHVwIHRvIHRoZSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3Bwb3NpdGUgb2Ygc3luYygpLlxuICAgKiBSZW1vdmVzIGZpbGVzIGluIG1pZ3JhdGlvbiBkaXJlY3Rvcnkgd2hpY2ggZG9uJ3QgZXhpc3QgaW4gZGF0YWJhc2UuXG4gICAqL1xuICBhc3luYyBwcnVuZSgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciA9IGZzLnJlYWRkaXJTeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5EYXRhYmFzZSA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQoe30pO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMvLnRlc3QoZmlsZSkpLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBtLmZpbGVuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgY3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGRiTWlncmF0aW9uc05vdE9uRnMgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5EYXRhYmFzZSwgbSA9PiB7XG4gICAgICAgIHJldHVybiAhXy5maW5kKG1pZ3JhdGlvbnNJbkZvbGRlciwgeyBmaWxlbmFtZTogbS5maWxlbmFtZSB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgbWlncmF0aW9uc1RvRGVsZXRlID0gZGJNaWdyYXRpb25zTm90T25Gcy5tYXAobSA9PiBtLm5hbWUpO1xuXG4gICAgICBpZiAoIXRoaXMuYXV0b3N5bmMgJiYgISFtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBkYXRhYmFzZSBidXQgbm90IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlci4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIHJlbW92ZSBmcm9tIHRoZSBmaWxlIHN5c3RlbS4nLFxuICAgICAgICAgICAgICBuYW1lOiAnbWlncmF0aW9uc1RvRGVsZXRlJyxcbiAgICAgICAgICAgICAgY2hvaWNlczogbWlncmF0aW9uc1RvRGVsZXRlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5zd2VycyA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvRGVsZXRlID0gYW5zd2Vycy5taWdyYXRpb25zVG9EZWxldGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHtcbiAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICB9KS5sZWFuKCk7XG5cbiAgICAgIGlmIChtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMubG9nKGBSZW1vdmluZyBtaWdyYXRpb24ocykgYCwgYCR7bWlncmF0aW9uc1RvRGVsZXRlLmpvaW4oJywgJyl9YC5jeWFuLCBgIGZyb20gZGF0YWJhc2VgKTtcbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwucmVtb3ZlKHtcbiAgICAgICAgICBuYW1lOiB7ICRpbjogbWlncmF0aW9uc1RvRGVsZXRlIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtaWdyYXRpb25zVG9EZWxldGVEb2NzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHBydW5lIGV4dHJhbmVvdXMgbWlncmF0aW9ucyBmcm9tIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0aGUgY3VycmVudCBtaWdyYXRpb25zIGFuZCB0aGVpciBzdGF0dXNlc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheTxPYmplY3Q+Pn1cbiAgICogQGV4YW1wbGVcbiAgICogICBbXG4gICAqICAgIHsgbmFtZTogJ215LW1pZ3JhdGlvbicsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDI0X215LW1pZ3JhdGlvbi5qcycsIHN0YXRlOiAndXAnIH0sXG4gICAqICAgIHsgbmFtZTogJ2FkZC1jb3dzJywgZmlsZW5hbWU6ICcxNDkyMTMyMjM0NTNfYWRkLWNvd3MuanMnLCBzdGF0ZTogJ2Rvd24nIH1cbiAgICogICBdXG4gICAqL1xuICBhc3luYyBsaXN0KCkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnMgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKCkuc29ydCh7IGNyZWF0ZWRBdDogMSB9KTtcbiAgICBpZiAoIW1pZ3JhdGlvbnMubGVuZ3RoKSB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gbGlzdC4nLnllbGxvdyk7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnMubWFwKG0gPT4ge1xuICAgICAgdGhpcy5sb2coYCR7bS5zdGF0ZSA9PSAndXAnID8gJ1VQOiAgXFx0JyA6ICdET1dOOlxcdCd9YFttLnN0YXRlID09ICd1cCcgPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke20uZmlsZW5hbWV9YCk7XG4gICAgICByZXR1cm4gbS50b0pTT04oKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxlUmVxdWlyZWQoZXJyb3IpIHtcbiAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT0gJ0VOT0VOVCcpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYENvdWxkIG5vdCBmaW5kIGFueSBmaWxlcyBhdCBwYXRoICcke2Vycm9yLnBhdGh9J2ApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWlncmF0b3I7XG4iXX0=