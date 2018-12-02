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
        var _this = this;

        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'up';
        var migrationName = arguments[1];

        var untilMigration, query, sortDirection, migrationsToRun, self, numMigrationsRan, migrationsRan, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

        return _regenerator2.default.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.sync();

              case 2:
                if (!migrationName) {
                  _context3.next = 8;
                  break;
                }

                _context3.next = 5;
                return MigrationModel.findOne({ name: migrationName });

              case 5:
                _context3.t0 = _context3.sent;
                _context3.next = 11;
                break;

              case 8:
                _context3.next = 10;
                return MigrationModel.findOne().sort({ createdAt: -1 });

              case 10:
                _context3.t0 = _context3.sent;

              case 11:
                untilMigration = _context3.t0;

                if (untilMigration) {
                  _context3.next = 18;
                  break;
                }

                if (!migrationName) {
                  _context3.next = 17;
                  break;
                }

                throw new ReferenceError("Could not find that migration in the database");

              case 17:
                throw new Error("There are no pending migrations.");

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
                _context3.next = 23;
                return MigrationModel.find(query).sort({ createdAt: sortDirection });

              case 23:
                migrationsToRun = _context3.sent;

                if (migrationsToRun.length) {
                  _context3.next = 31;
                  break;
                }

                if (!this.cli) {
                  _context3.next = 30;
                  break;
                }

                this.log('There are no migrations to run'.yellow);
                this.log('Current Migrations\' Statuses: ');
                _context3.next = 30;
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
                _context3.prev = 37;
                _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                  var migration, migrationFilePath, migrationFunctions;
                  return _regenerator2.default.wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          migration = _step.value;
                          migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);

                          if (_this.es6) {
                            require('babel-register')({
                              "presets": [require("babel-preset-latest")],
                              "plugins": [require("babel-plugin-transform-runtime")]
                            });

                            require('babel-polyfill');
                          }

                          migrationFunctions = void 0;
                          _context2.prev = 4;

                          migrationFunctions = require(migrationFilePath);
                          _context2.next = 12;
                          break;

                        case 8:
                          _context2.prev = 8;
                          _context2.t0 = _context2['catch'](4);

                          _context2.t0.message = _context2.t0.message && /Unexpected token/.test(_context2.t0.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t0.message;
                          throw _context2.t0;

                        case 12:
                          if (migrationFunctions[direction]) {
                            _context2.next = 14;
                            break;
                          }

                          throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

                        case 14:
                          _context2.prev = 14;
                          _context2.next = 17;
                          return new _bluebird2.default(function (resolve, reject) {
                            var callPromise = migrationFunctions[direction].call(_this.connection.model.bind(_this.connection), function callback(err) {
                              if (err) return reject(err);
                              resolve();
                            });

                            if (callPromise && typeof callPromise.then === 'function') {
                              callPromise.then(resolve).catch(reject);
                            }
                          });

                        case 17:

                          _this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                          _context2.next = 20;
                          return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

                        case 20:
                          migrationsRan.push(migration.toJSON());
                          numMigrationsRan++;
                          _context2.next = 29;
                          break;

                        case 24:
                          _context2.prev = 24;
                          _context2.t1 = _context2['catch'](14);

                          _this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                          _this.log('Not continuing. Make sure your data is in consistent state'.red);
                          throw _context2.t1 instanceof Error ? _context2.t1 : new Error(_context2.t1);

                        case 29:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _loop, _this, [[4, 8], [14, 24]]);
                });
                _iterator = (0, _getIterator3.default)(migrationsToRun);

              case 40:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context3.next = 45;
                  break;
                }

                return _context3.delegateYield(_loop(), 't1', 42);

              case 42:
                _iteratorNormalCompletion = true;
                _context3.next = 40;
                break;

              case 45:
                _context3.next = 51;
                break;

              case 47:
                _context3.prev = 47;
                _context3.t2 = _context3['catch'](37);
                _didIteratorError = true;
                _iteratorError = _context3.t2;

              case 51:
                _context3.prev = 51;
                _context3.prev = 52;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 54:
                _context3.prev = 54;

                if (!_didIteratorError) {
                  _context3.next = 57;
                  break;
                }

                throw _iteratorError;

              case 57:
                return _context3.finish(54);

              case 58:
                return _context3.finish(51);

              case 59:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context3.abrupt('return', migrationsRan);

              case 61:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee2, this, [[37, 47, 51, 59], [52,, 54, 58]]);
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
        var _this2 = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
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
                  _context5.next = 14;
                  break;
                }

                _context5.next = 12;
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
                answers = _context5.sent;


                migrationsToImport = answers.migrationsToImport;

              case 14:
                return _context5.abrupt('return', _bluebird2.default.map(migrationsToImport, function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(migrationToImport) {
                    var filePath, timestampSeparatorIndex, timestamp, migrationName, createdMigration;
                    return _regenerator2.default.wrap(function _callee3$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            filePath = _path2.default.join(_this2.migrationPath, migrationToImport), timestampSeparatorIndex = migrationToImport.indexOf('-'), timestamp = migrationToImport.slice(0, timestampSeparatorIndex), migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));


                            _this2.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                            _context4.next = 4;
                            return MigrationModel.create({
                              name: migrationName,
                              createdAt: timestamp
                            });

                          case 4:
                            createdMigration = _context4.sent;
                            return _context4.abrupt('return', createdMigration.toJSON());

                          case 6:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x4) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5['catch'](0);

                this.log('Could not synchronise migrations in the migrations folder up to the database.'.red);
                throw _context5.t0;

              case 21:
              case 'end':
                return _context5.stop();
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
        return _regenerator2.default.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context6.next = 4;
                return MigrationModel.find({});

              case 4:
                migrationsInDatabase = _context6.sent;

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
                  _context6.next = 13;
                  break;
                }

                _context6.next = 11;
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
                answers = _context6.sent;


                migrationsToDelete = answers.migrationsToDelete;

              case 13:
                _context6.next = 15;
                return MigrationModel.find({
                  name: { $in: migrationsToDelete }
                }).lean();

              case 15:
                migrationsToDeleteDocs = _context6.sent;

                if (!migrationsToDelete.length) {
                  _context6.next = 20;
                  break;
                }

                this.log('Removing migration(s) ', ('' + migrationsToDelete.join(', ')).cyan, ' from database');
                _context6.next = 20;
                return MigrationModel.remove({
                  name: { $in: migrationsToDelete }
                });

              case 20:
                return _context6.abrupt('return', migrationsToDeleteDocs);

              case 23:
                _context6.prev = 23;
                _context6.t0 = _context6['catch'](0);

                this.log('Could not prune extraneous migrations from database.'.red);
                throw _context6.t0;

              case 27:
              case 'end':
                return _context6.stop();
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
        var _this3 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.sync();

              case 2:
                _context7.next = 4;
                return MigrationModel.find().sort({ createdAt: 1 });

              case 4:
                migrations = _context7.sent;

                if (!migrations.length) this.log('There are no migrations to list.'.yellow);
                return _context7.abrupt('return', migrations.map(function (m) {
                  _this3.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context7.stop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJQcm9taXNlIiwiY29uZmlnIiwid2FybmluZ3MiLCJlczZUZW1wbGF0ZSIsImVzNVRlbXBsYXRlIiwiTWlncmF0b3IiLCJ0ZW1wbGF0ZVBhdGgiLCJtaWdyYXRpb25zUGF0aCIsImRiQ29ubmVjdGlvblVyaSIsImVzNlRlbXBsYXRlcyIsImNvbGxlY3Rpb25OYW1lIiwiYXV0b3N5bmMiLCJjbGkiLCJjb25uZWN0aW9uIiwiZGVmYXVsdFRlbXBsYXRlIiwidGVtcGxhdGUiLCJmcyIsInJlYWRGaWxlU3luYyIsIm1pZ3JhdGlvblBhdGgiLCJwYXRoIiwicmVzb2x2ZSIsIm1vbmdvb3NlIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJta2RpcnAiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsInJlcXVpcmUiLCJtaWdyYXRpb25GdW5jdGlvbnMiLCJtZXNzYWdlIiwidGVzdCIsInJlamVjdCIsImNhbGxQcm9taXNlIiwiY2FsbCIsIm1vZGVsIiwiYmluZCIsImNhbGxiYWNrIiwiZXJyIiwidGhlbiIsImNhdGNoIiwidG9VcHBlckNhc2UiLCJ3aGVyZSIsInVwZGF0ZSIsIiRzZXQiLCJwdXNoIiwidG9KU09OIiwiZ3JlZW4iLCJmaWxlc0luTWlncmF0aW9uRm9sZGVyIiwicmVhZGRpclN5bmMiLCJtaWdyYXRpb25zSW5EYXRhYmFzZSIsIm1pZ3JhdGlvbnNJbkZvbGRlciIsIl8iLCJmaWx0ZXIiLCJmaWxlIiwibWFwIiwiZmlsZUNyZWF0ZWRBdCIsInBhcnNlSW50Iiwic3BsaXQiLCJleGlzdHNJbkRhdGFiYXNlIiwic29tZSIsIm0iLCJmaWxlc05vdEluRGIiLCJmIiwibWlncmF0aW9uc1RvSW1wb3J0IiwiYXNrIiwicHJvbXB0IiwidHlwZSIsImNob2ljZXMiLCJhbnN3ZXJzIiwibWlncmF0aW9uVG9JbXBvcnQiLCJmaWxlUGF0aCIsInRpbWVzdGFtcFNlcGFyYXRvckluZGV4IiwiaW5kZXhPZiIsInRpbWVzdGFtcCIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJjcmVhdGVkTWlncmF0aW9uIiwiZGJNaWdyYXRpb25zTm90T25GcyIsIm1pZ3JhdGlvbnNUb0RlbGV0ZSIsIiRpbiIsImxlYW4iLCJtaWdyYXRpb25zVG9EZWxldGVEb2NzIiwiY3lhbiIsInJlbW92ZSIsIm1pZ3JhdGlvbnMiLCJlcnJvciIsImNvZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUNBLElBQUlBLHVCQUFKOztBQUVBQyxtQkFBUUMsTUFBUixDQUFlO0FBQ2JDLFlBQVU7QUFERyxDQUFmOztBQUlBLElBQU1DLDhTQUFOOztBQWlCQSxJQUFNQywwU0FBTjs7SUFtQnFCQyxRO0FBQ25CLDBCQVNHO0FB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QTJCLEVBQUVMLFdBQVcsQ0FBYixFQUEzQixDOzs7QUFBbkJpRiwwQjs7QUFDTixvQkFBSSxDQUFDQSxXQUFXbEUsTUFBaEIsRUFBd0IsS0FBSy9CLEdBQUwsQ0FBUyxtQ0FBbUNnQyxNQUE1QztrREFDakJpRSxXQUFXOUIsR0FBWCxDQUFlLFVBQUNNLENBQUQsRUFBTztBQUMzQix5QkFBS3pFLEdBQUwsQ0FDRSxPQUFHeUUsRUFBRS9DLEtBQUYsSUFBVyxJQUFYLEdBQWtCLFNBQWxCLEdBQThCLFNBQWpDLEdBQTZDK0MsRUFBRS9DLEtBQUYsSUFBVyxJQUFYLEdBQWlCLE9BQWpCLEdBQTJCLEtBQXhFLFdBQ0krQyxFQUFFbEMsUUFETixDQURGO0FBSUEseUJBQU9rQyxFQUFFZixNQUFGLEVBQVA7QUFDRCxpQkFOTSxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFqVFVqRixROzs7QUE2VHJCLFNBQVMwQyxZQUFULENBQXNCK0UsS0FBdEIsRUFBNkI7QUFDM0IsTUFBSUEsU0FBU0EsTUFBTUMsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSTVFLGNBQUoseUNBQXdEMkUsTUFBTTNHLElBQTlELFFBQU47QUFDRDtBQUNGOztBQUdENkcsT0FBT0MsT0FBUCxHQUFpQjVILFFBQWpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAnY29sb3JzJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGFzayBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCBNaWdyYXRpb25Nb2RlbEZhY3RvcnkgZnJvbSAnLi9kYic7XG5sZXQgTWlncmF0aW9uTW9kZWw7XG5cblByb21pc2UuY29uZmlnKHtcbiAgd2FybmluZ3M6IGZhbHNlXG59KTtcblxuY29uc3QgZXM2VGVtcGxhdGUgPVxuYFxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93biAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5gO1xuXG5jb25zdCBlczVUZW1wbGF0ZSA9XG5gJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnRzLnVwID0gZnVuY3Rpb24gdXAgKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnRzLmRvd24gPSBmdW5jdGlvbiBkb3duKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcbmA7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlncmF0b3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdGVtcGxhdGVQYXRoLFxuICAgIG1pZ3JhdGlvbnNQYXRoID0gJy4vbWlncmF0aW9ucycsXG4gICAgZGJDb25uZWN0aW9uVXJpLFxuICAgIGVzNlRlbXBsYXRlcyA9IGZhbHNlLFxuICAgIGNvbGxlY3Rpb25OYW1lID0gJ21pZ3JhdGlvbnMnLFxuICAgIGF1dG9zeW5jID0gZmFsc2UsXG4gICAgY2xpID0gZmFsc2UsXG4gICAgY29ubmVjdGlvblxuICB9KSB7XG4gICAgY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gZXM2VGVtcGxhdGVzID8gIGVzNlRlbXBsYXRlIDogZXM1VGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlUGF0aCA/IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZVBhdGgsICd1dGYtOCcpIDogZGVmYXVsdFRlbXBsYXRlO1xuICAgIHRoaXMubWlncmF0aW9uUGF0aCA9IHBhdGgucmVzb2x2ZShtaWdyYXRpb25zUGF0aCk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvbiB8fCBtb25nb29zZS5jcmVhdGVDb25uZWN0aW9uKGRiQ29ubmVjdGlvblVyaSk7XG4gICAgdGhpcy5lczYgPSBlczZUZW1wbGF0ZXM7XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvbk5hbWU7XG4gICAgdGhpcy5hdXRvc3luYyA9IGF1dG9zeW5jO1xuICAgIHRoaXMuY2xpID0gY2xpO1xuICAgIE1pZ3JhdGlvbk1vZGVsID0gTWlncmF0aW9uTW9kZWxGYWN0b3J5KGNvbGxlY3Rpb25OYW1lLCB0aGlzLmNvbm5lY3Rpb24pO1xuICB9XG5cbiAgbG9nIChsb2dTdHJpbmcsIGZvcmNlID0gZmFsc2UpIHtcbiAgICBpZiAoZm9yY2UgfHwgdGhpcy5jbGkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGxvZ1N0cmluZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB5b3VyIG93biBNb25nb29zZSBjb25uZWN0aW9uIG9iamVjdCAoc28geW91IGNhbiB1c2UgdGhpcygnbW9kZWxuYW1lJylcbiAgICogQHBhcmFtIHttb25nb29zZS5jb25uZWN0aW9ufSBjb25uZWN0aW9uIC0gTW9uZ29vc2UgY29ubmVjdGlvblxuICAgKi9cbiAgc2V0TW9uZ29vc2VDb25uZWN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgTWlncmF0aW9uTW9kZWwgPSBNaWdyYXRpb25Nb2RlbEZhY3RvcnkodGhpcy5jb2xsZWN0aW9uLCBjb25uZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoZSB1bmRlcmx5aW5nIGNvbm5lY3Rpb24gdG8gbW9uZ29cbiAgICogQHJldHVybnMge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWRcbiAgICovXG4gIGNsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gPyB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKSA6IFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBtaWdyYXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1pZ3JhdGlvbk5hbWVcbiAgICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gQSBwcm9taXNlIG9mIHRoZSBNaWdyYXRpb24gY3JlYXRlZFxuICAgKi9cbiAgYXN5bmMgY3JlYXRlKG1pZ3JhdGlvbk5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXhpc3RpbmdNaWdyYXRpb24gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHsgbmFtZTogbWlncmF0aW9uTmFtZSB9KTtcbiAgICAgIGlmICghIWV4aXN0aW5nTWlncmF0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUgaXMgYWxyZWFkeSBhIG1pZ3JhdGlvbiB3aXRoIG5hbWUgJyR7bWlncmF0aW9uTmFtZX0nIGluIHRoZSBkYXRhYmFzZWAucmVkKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgbmV3TWlncmF0aW9uRmlsZSA9IGAke25vd30tJHttaWdyYXRpb25OYW1lfS5qc2A7XG4gICAgICBta2RpcnAuc3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBuZXdNaWdyYXRpb25GaWxlKSwgdGhpcy50ZW1wbGF0ZSk7XG4gICAgICAvLyBjcmVhdGUgaW5zdGFuY2UgaW4gZGJcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkNyZWF0ZWQgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICBjcmVhdGVkQXQ6IG5vd1xuICAgICAgfSk7XG4gICAgICB0aGlzLmxvZyhgQ3JlYXRlZCBtaWdyYXRpb24gJHttaWdyYXRpb25OYW1lfSBpbiAke3RoaXMubWlncmF0aW9uUGF0aH0uYCk7XG4gICAgICByZXR1cm4gbWlncmF0aW9uQ3JlYXRlZDtcbiAgICB9IGNhdGNoKGVycm9yKXtcbiAgICAgIHRoaXMubG9nKGVycm9yLnN0YWNrKTtcbiAgICAgIGZpbGVSZXF1aXJlZChlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgbWlncmF0aW9ucyB1cCB0byBvciBkb3duIHRvIGEgZ2l2ZW4gbWlncmF0aW9uIG5hbWVcbiAgICpcbiAgICogQHBhcmFtIG1pZ3JhdGlvbk5hbWVcbiAgICogQHBhcmFtIGRpcmVjdGlvblxuICAgKi9cbiAgYXN5bmMgcnVuKGRpcmVjdGlvbiA9ICd1cCcsIG1pZ3JhdGlvbk5hbWUpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcblxuICAgIGNvbnN0IHVudGlsTWlncmF0aW9uID0gbWlncmF0aW9uTmFtZSA/XG4gICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHtuYW1lOiBtaWdyYXRpb25OYW1lfSkgOlxuICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSgpLnNvcnQoe2NyZWF0ZWRBdDogLTF9KTtcblxuICAgIGlmICghdW50aWxNaWdyYXRpb24pIHtcbiAgICAgIGlmIChtaWdyYXRpb25OYW1lKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGF0IG1pZ3JhdGlvbiBpbiB0aGUgZGF0YWJhc2VcIik7XG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGFyZSBubyBwZW5kaW5nIG1pZ3JhdGlvbnMuXCIpO1xuICAgIH1cblxuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNyZWF0ZWRBdDogeyRsdGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdH0sXG4gICAgICBzdGF0ZTogJ2Rvd24nXG4gICAgfTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG4gICAgICBxdWVyeSA9IHtcbiAgICAgICAgY3JlYXRlZEF0OiB7JGd0ZTogdW50aWxNaWdyYXRpb24uY3JlYXRlZEF0fSxcbiAgICAgICAgc3RhdGU6ICd1cCdcbiAgICAgIH07XG4gICAgfVxuXG5cbiAgICBjb25zdCBzb3J0RGlyZWN0aW9uID0gZGlyZWN0aW9uID09ICd1cCcgPyAxIDogLTE7XG4gICAgY29uc3QgbWlncmF0aW9uc1RvUnVuID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZChxdWVyeSlcbiAgICAgIC5zb3J0KHtjcmVhdGVkQXQ6IHNvcnREaXJlY3Rpb259KTtcblxuICAgIGlmICghbWlncmF0aW9uc1RvUnVuLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuY2xpKSB7XG4gICAgICAgIHRoaXMubG9nKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nLnllbGxvdyk7XG4gICAgICAgIHRoaXMubG9nKGBDdXJyZW50IE1pZ3JhdGlvbnMnIFN0YXR1c2VzOiBgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5saXN0KCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIHJ1bicpO1xuICAgIH1cblxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgbnVtTWlncmF0aW9uc1JhbiA9IDA7XG4gICAgbGV0IG1pZ3JhdGlvbnNSYW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnNUb1J1bikge1xuICAgICAgY29uc3QgbWlncmF0aW9uRmlsZVBhdGggPSBwYXRoLmpvaW4oc2VsZi5taWdyYXRpb25QYXRoLCBtaWdyYXRpb24uZmlsZW5hbWUpO1xuICAgICAgaWYgKHRoaXMuZXM2KSB7XG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXJlZ2lzdGVyJykoe1xuICAgICAgICAgIFwicHJlc2V0c1wiOiBbcmVxdWlyZShcImJhYmVsLXByZXNldC1sYXRlc3RcIildLFxuICAgICAgICAgIFwicGx1Z2luc1wiOiBbcmVxdWlyZShcImJhYmVsLXBsdWdpbi10cmFuc2Zvcm0tcnVudGltZVwiKV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxdWlyZSgnYmFiZWwtcG9seWZpbGwnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IG1pZ3JhdGlvbkZ1bmN0aW9ucztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbWlncmF0aW9uRnVuY3Rpb25zID0gcmVxdWlyZShtaWdyYXRpb25GaWxlUGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZSAmJiAvVW5leHBlY3RlZCB0b2tlbi8udGVzdChlcnIubWVzc2FnZSkgP1xuICAgICAgICAgICdVbmV4cGVjdGVkIFRva2VuIHdoZW4gcGFyc2luZyBtaWdyYXRpb24uIElmIHlvdSBhcmUgdXNpbmcgYW4gRVM2IG1pZ3JhdGlvbiBmaWxlLCB1c2Ugb3B0aW9uIC0tZXM2JyA6XG4gICAgICAgICAgZXJyLm1lc3NhZ2U7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKGBUaGUgJHtkaXJlY3Rpb259IGV4cG9ydCBpcyBub3QgZGVmaW5lZCBpbiAke21pZ3JhdGlvbi5maWxlbmFtZX0uYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ubW9kZWwuYmluZCh0aGlzLmNvbm5lY3Rpb24pLFxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoY2FsbFByb21pc2UgJiYgdHlwZW9mIGNhbGxQcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxQcm9taXNlLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubG9nKGAke2RpcmVjdGlvbi50b1VwcGVyQ2FzZSgpfTogICBgW2RpcmVjdGlvbiA9PSAndXAnPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke21pZ3JhdGlvbi5maWxlbmFtZX0gYCk7XG5cbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwud2hlcmUoe25hbWU6IG1pZ3JhdGlvbi5uYW1lfSkudXBkYXRlKHskc2V0OiB7c3RhdGU6IGRpcmVjdGlvbn19KTtcbiAgICAgICAgbWlncmF0aW9uc1Jhbi5wdXNoKG1pZ3JhdGlvbi50b0pTT04oKSk7XG4gICAgICAgIG51bU1pZ3JhdGlvbnNSYW4rKztcbiAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgIHRoaXMubG9nKGBGYWlsZWQgdG8gcnVuIG1pZ3JhdGlvbiAke21pZ3JhdGlvbi5uYW1lfSBkdWUgdG8gYW4gZXJyb3IuYC5yZWQpO1xuICAgICAgICB0aGlzLmxvZyhgTm90IGNvbnRpbnVpbmcuIE1ha2Ugc3VyZSB5b3VyIGRhdGEgaXMgaW4gY29uc2lzdGVudCBzdGF0ZWAucmVkKTtcbiAgICAgICAgdGhyb3cgZXJyIGluc3RhbmNlb2YoRXJyb3IpID8gZXJyIDogbmV3IEVycm9yKGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pZ3JhdGlvbnNUb1J1bi5sZW5ndGggPT0gbnVtTWlncmF0aW9uc1JhbikgdGhpcy5sb2coJ0FsbCBtaWdyYXRpb25zIGZpbmlzaGVkIHN1Y2Nlc3NmdWxseS4nLmdyZWVuKTtcbiAgICByZXR1cm4gbWlncmF0aW9uc1JhbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rcyBhdCB0aGUgZmlsZSBzeXN0ZW0gbWlncmF0aW9ucyBhbmQgaW1wb3J0cyBhbnkgbWlncmF0aW9ucyB0aGF0IGFyZVxuICAgKiBvbiB0aGUgZmlsZSBzeXN0ZW0gYnV0IG1pc3NpbmcgaW4gdGhlIGRhdGFiYXNlIGludG8gdGhlIGRhdGFiYXNlXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvcHBvc2l0ZSBvZiBwcnVuZSgpXG4gICAqL1xuICBhc3luYyBzeW5jKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcyQvLnRlc3QoZmlsZSkpXG4gICAgICAgIC5tYXAoZmlsZW5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gbWlncmF0aW9uc0luRGF0YWJhc2Uuc29tZShtID0+IGZpbGVuYW1lID09IG0uZmlsZW5hbWUpO1xuICAgICAgICAgIHJldHVybiB7Y3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZX07XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBmaWxlc05vdEluRGIgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5Gb2xkZXIsIHtleGlzdHNJbkRhdGFiYXNlOiBmYWxzZX0pLm1hcChmID0+IGYuZmlsZW5hbWUpO1xuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGZpbGVzTm90SW5EYjtcbiAgICAgIHRoaXMubG9nKCdTeW5jaHJvbml6aW5nIGRhdGFiYXNlIHdpdGggZmlsZSBzeXN0ZW0gbWlncmF0aW9ucy4uLicpO1xuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmIG1pZ3JhdGlvbnNUb0ltcG9ydC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdCh7XG4gICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgYnV0IG5vdCBpbiB0aGUgZGF0YWJhc2UuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byBpbXBvcnQgaW50byB0aGUgZGF0YWJhc2UnLFxuICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0ltcG9ydCcsXG4gICAgICAgICAgICBjaG9pY2VzOiBmaWxlc05vdEluRGJcbiAgICAgICAgICB9LCAoYW5zd2VycykgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvSW1wb3J0ID0gYW5zd2Vycy5taWdyYXRpb25zVG9JbXBvcnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLm1hcChtaWdyYXRpb25zVG9JbXBvcnQsIGFzeW5jIChtaWdyYXRpb25Ub0ltcG9ydCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvblRvSW1wb3J0KSxcbiAgICAgICAgICB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCA9IG1pZ3JhdGlvblRvSW1wb3J0LmluZGV4T2YoJy0nKSxcbiAgICAgICAgICB0aW1lc3RhbXAgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSgwLCB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCksXG4gICAgICAgICAgbWlncmF0aW9uTmFtZSA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ICsgMSwgbWlncmF0aW9uVG9JbXBvcnQubGFzdEluZGV4T2YoJy4nKSk7XG5cbiAgICAgICAgdGhpcy5sb2coYEFkZGluZyBtaWdyYXRpb24gJHtmaWxlUGF0aH0gaW50byBkYXRhYmFzZSBmcm9tIGZpbGUgc3lzdGVtLiBTdGF0ZSBpcyBgICsgYERPV05gLnJlZCk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRNaWdyYXRpb24gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVkTWlncmF0aW9uLnRvSlNPTigpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3Qgc3luY2hyb25pc2UgbWlncmF0aW9ucyBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgdXAgdG8gdGhlIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcHBvc2l0ZSBvZiBzeW5jKCkuXG4gICAqIFJlbW92ZXMgZmlsZXMgaW4gbWlncmF0aW9uIGRpcmVjdG9yeSB3aGljaCBkb24ndCBleGlzdCBpbiBkYXRhYmFzZS5cbiAgICovXG4gIGFzeW5jIHBydW5lKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcy8udGVzdChmaWxlKSApXG4gICAgICAgIC5tYXAoZmlsZW5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gbWlncmF0aW9uc0luRGF0YWJhc2Uuc29tZShtID0+IGZpbGVuYW1lID09IG0uZmlsZW5hbWUpO1xuICAgICAgICAgIHJldHVybiB7IGNyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsICBleGlzdHNJbkRhdGFiYXNlIH07XG4gICAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYk1pZ3JhdGlvbnNOb3RPbkZzID0gXy5maWx0ZXIobWlncmF0aW9uc0luRGF0YWJhc2UsIG0gPT4ge1xuICAgICAgICByZXR1cm4gIV8uZmluZChtaWdyYXRpb25zSW5Gb2xkZXIsIHsgZmlsZW5hbWU6IG0uZmlsZW5hbWUgfSlcbiAgICAgIH0pO1xuXG5cbiAgICAgIGxldCBtaWdyYXRpb25zVG9EZWxldGUgPSBkYk1pZ3JhdGlvbnNOb3RPbkZzLm1hcCggbSA9PiBtLm5hbWUgKTtcblxuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmICEhbWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICBhc2sucHJvbXB0KHtcbiAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBkYXRhYmFzZSBidXQgbm90IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlci4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIHJlbW92ZSBmcm9tIHRoZSBmaWxlIHN5c3RlbS4nLFxuICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0RlbGV0ZScsXG4gICAgICAgICAgICBjaG9pY2VzOiBtaWdyYXRpb25zVG9EZWxldGVcbiAgICAgICAgICB9LCAoYW5zd2VycykgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvRGVsZXRlID0gYW5zd2Vycy5taWdyYXRpb25zVG9EZWxldGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbFxuICAgICAgICAuZmluZCh7XG4gICAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICAgIH0pLmxlYW4oKTtcblxuICAgICAgaWYgKG1pZ3JhdGlvbnNUb0RlbGV0ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5sb2coYFJlbW92aW5nIG1pZ3JhdGlvbihzKSBgLCBgJHttaWdyYXRpb25zVG9EZWxldGUuam9pbignLCAnKX1gLmN5YW4sIGAgZnJvbSBkYXRhYmFzZWApO1xuICAgICAgICBhd2FpdCBNaWdyYXRpb25Nb2RlbC5yZW1vdmUoe1xuICAgICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3M7XG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBwcnVuZSBleHRyYW5lb3VzIG1pZ3JhdGlvbnMgZnJvbSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIGN1cnJlbnQgbWlncmF0aW9ucyBhbmQgdGhlaXIgc3RhdHVzZXNcbiAgICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8T2JqZWN0Pj59XG4gICAqIEBleGFtcGxlXG4gICAqICAgW1xuICAgKiAgICB7IG5hbWU6ICdteS1taWdyYXRpb24nLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQyNF9teS1taWdyYXRpb24uanMnLCBzdGF0ZTogJ3VwJyB9LFxuICAgKiAgICB7IG5hbWU6ICdhZGQtY293cycsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDUzX2FkZC1jb3dzLmpzJywgc3RhdGU6ICdkb3duJyB9XG4gICAqICAgXVxuICAgKi9cbiAgYXN5bmMgbGlzdCgpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICBjb25zdCBtaWdyYXRpb25zID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCgpLnNvcnQoeyBjcmVhdGVkQXQ6IDEgfSk7XG4gICAgaWYgKCFtaWdyYXRpb25zLmxlbmd0aCkgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIGxpc3QuJy55ZWxsb3cpO1xuICAgIHJldHVybiBtaWdyYXRpb25zLm1hcCgobSkgPT4ge1xuICAgICAgdGhpcy5sb2coXG4gICAgICAgIGAke20uc3RhdGUgPT0gJ3VwJyA/ICdVUDogIFxcdCcgOiAnRE9XTjpcXHQnfWBbbS5zdGF0ZSA9PSAndXAnPyAnZ3JlZW4nIDogJ3JlZCddICtcbiAgICAgICAgYCAke20uZmlsZW5hbWV9YFxuICAgICAgKTtcbiAgICAgIHJldHVybiBtLnRvSlNPTigpO1xuICAgIH0pO1xuICB9XG59XG5cblxuXG5mdW5jdGlvbiBmaWxlUmVxdWlyZWQoZXJyb3IpIHtcbiAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT0gJ0VOT0VOVCcpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYENvdWxkIG5vdCBmaW5kIGFueSBmaWxlcyBhdCBwYXRoICcke2Vycm9yLnBhdGh9J2ApO1xuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNaWdyYXRvcjtcblxuIl19