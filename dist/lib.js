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
                  var migration, migrationFilePath, modulesPath, code, migrationFunctions;
                  return _regenerator2.default.wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          migration = _step.value;
                          migrationFilePath = _path2.default.join(self.migrationPath, migration.filename);
                          modulesPath = _path2.default.resolve(__dirname, '../', 'node_modules');
                          code = _fs2.default.readFileSync(migrationFilePath);

                          if (_this.es6) {
                            require('babel-register')({
                              presets: [require('babel-preset-latest')],
                              plugins: [require('babel-plugin-transform-runtime')]
                            });

                            require('babel-polyfill');
                          }

                          migrationFunctions = void 0;
                          _context2.prev = 6;

                          migrationFunctions = require(migrationFilePath);
                          _context2.next = 14;
                          break;

                        case 10:
                          _context2.prev = 10;
                          _context2.t0 = _context2['catch'](6);

                          _context2.t0.message = _context2.t0.message && /Unexpected token/.test(_context2.t0.message) ? 'Unexpected Token when parsing migration. If you are using an ES6 migration file, use option --es6' : _context2.t0.message;
                          throw _context2.t0;

                        case 14:
                          if (migrationFunctions[direction]) {
                            _context2.next = 16;
                            break;
                          }

                          throw new Error(('The ' + direction + ' export is not defined in ' + migration.filename + '.').red);

                        case 16:
                          _context2.prev = 16;
                          _context2.next = 19;
                          return new _bluebird2.default(function (resolve, reject) {
                            var callPromise = migrationFunctions[direction].call(_this.connection.model.bind(_this.connection), function callback(err) {
                              if (err) return reject(err);
                              resolve();
                            });

                            if (callPromise && typeof callPromise.then === 'function') {
                              callPromise.then(resolve).catch(reject);
                            }
                          });

                        case 19:

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

                          // const callPromise = migrationFunctions[direction];
                          // callPromise.bind(this.connection.model.bind(this.connection));
                          // await callPromise();

                          _this.log((direction.toUpperCase() + ':   ')[direction == 'up' ? 'green' : 'red'] + (' ' + migration.filename + ' '));

                          _context2.next = 22;
                          return MigrationModel.where({ name: migration.name }).update({ $set: { state: direction } });

                        case 22:
                          migrationsRan.push(migration.toJSON());
                          numMigrationsRan++;
                          _context2.next = 32;
                          break;

                        case 26:
                          _context2.prev = 26;
                          _context2.t1 = _context2['catch'](16);

                          console.error(_context2.t1);
                          _this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                          _this.log('Not continuing. Make sure your data is in consistent state'.red);
                          throw _context2.t1 instanceof Error ? _context2.t1 : new Error(_context2.t1);

                        case 32:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _loop, _this, [[6, 10], [16, 26]]);
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
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var _this2 = this;

        var filesInMigrationFolder, migrationsInDatabase, migrationsInFolder, filesNotInDb, migrationsToImport, answers;
        return _regenerator2.default.wrap(function _callee3$(_context4) {
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
                return _context4.abrupt('return', _bluebird2.default.map(migrationsToImport, function (migrationToImport) {
                  var filePath = _path2.default.join(_this2.migrationPath, migrationToImport),
                      timestampSeparatorIndex = migrationToImport.indexOf('-'),
                      timestamp = migrationToImport.slice(0, timestampSeparatorIndex),
                      migrationName = migrationToImport.slice(timestampSeparatorIndex + 1, migrationToImport.lastIndexOf('.'));

                  _this2.log('Adding migration ' + filePath + ' into database from file system. State is ' + 'DOWN'.red);
                  return MigrationModel.create({
                    name: migrationName,
                    createdAt: timestamp
                  }).then(function (createdMigration) {
                    return createdMigration.toJSON();
                  });
                }));

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
        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                filesInMigrationFolder = _fs2.default.readdirSync(this.migrationPath);
                _context5.next = 4;
                return MigrationModel.find({}).lean();

              case 4:
                migrationsInDatabase = _context5.sent;

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
        var _this3 = this;

        var migrations;
        return _regenerator2.default.wrap(function _callee5$(_context6) {
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
                  _this3.log(('' + (m.state == 'up' ? 'UP:  \t' : 'DOWN:\t'))[m.state == 'up' ? 'green' : 'red'] + (' ' + m.filename));
                  return m.toJSON();
                }));

              case 7:
              case 'end':
                return _context6.stop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJQcm9taXNlIiwiY29uZmlnIiwid2FybmluZ3MiLCJtb25nb29zZSIsImVzNlRlbXBsYXRlIiwiZXM1VGVtcGxhdGUiLCJNaWdyYXRvciIsInRlbXBsYXRlUGF0aCIsIm1pZ3JhdGlvbnNQYXRoIiwiZGJDb25uZWN0aW9uVXJpIiwiZXM2VGVtcGxhdGVzIiwiY29sbGVjdGlvbk5hbWUiLCJhdXRvc3luYyIsImNsaSIsImRlZmF1bHRUZW1wbGF0ZSIsInRlbXBsYXRlIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJtaWdyYXRpb25QYXRoIiwicGF0aCIsInJlc29sdmUiLCJjb25uZWN0aW9uIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJta2RpcnAiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJwcmVzZXRzIiwicGx1Z2lucyIsIm1pZ3JhdGlvbkZ1bmN0aW9ucyIsIm1lc3NhZ2UiLCJ0ZXN0IiwicmVqZWN0IiwiY2FsbFByb21pc2UiLCJjYWxsIiwibW9kZWwiLCJiaW5kIiwiY2FsbGJhY2siLCJlcnIiLCJ0aGVuIiwiY2F0Y2giLCJ0b1VwcGVyQ2FzZSIsIndoZXJlIiwidXBkYXRlIiwiJHNldCIsInB1c2giLCJ0b0pTT04iLCJlcnJvciIsImdyZWVuIiwiZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciIsInJlYWRkaXJTeW5jIiwibWlncmF0aW9uc0luRGF0YWJhc2UiLCJtaWdyYXRpb25zSW5Gb2xkZXIiLCJfIiwiZmlsdGVyIiwiZmlsZSIsIm1hcCIsImZpbGVDcmVhdGVkQXQiLCJwYXJzZUludCIsInNwbGl0IiwiZXhpc3RzSW5EYXRhYmFzZSIsInNvbWUiLCJtIiwiZmlsZXNOb3RJbkRiIiwiZiIsIm1pZ3JhdGlvbnNUb0ltcG9ydCIsImFzayIsInByb21wdCIsInR5cGUiLCJjaG9pY2VzIiwiYW5zd2VycyIsImZpbGVQYXRoIiwibWlncmF0aW9uVG9JbXBvcnQiLCJ0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJ0aW1lc3RhbXAiLCJzbGljZSIsImxhc3RJbmRleE9mIiwiY3JlYXRlZE1pZ3JhdGlvbiIsImxlYW4iLCJkYk1pZ3JhdGlvbnNOb3RPbkZzIiwibWlncmF0aW9uc1RvRGVsZXRlIiwiJGluIiwibWlncmF0aW9uc1RvRGVsZXRlRG9jcyIsImN5YW4iLCJyZW1vdmUiLCJtaWdyYXRpb25zIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFDQSxJQUFJQSx1QkFBSjs7QUFFQUMsbUJBQVFDLE1BQVIsQ0FBZTtBQUNiQyxZQUFVO0FBREcsQ0FBZjs7QUFJQUMsbUJBQVNILE9BQVQsR0FBbUJBLGtCQUFuQjs7QUFFQSxJQUFNSSw4U0FBTjs7QUFnQkEsSUFBTUMsMFNBQU47O0lBaUJxQkMsUTtBQUNuQiwwQkFRRztBQUFBLFFBUERDLFlBT0MsUUFQREEsWUFPQztBQUFBLG1DQU5EQyxjQU1DO0FBQUEsUUFOREEsY0FNQyx1Q0FOZ0IsY0FNaEI7QUFBQSxRQUxEQyxlQUtDLFFBTERBLGVBS0M7QUFBQSxpQ0FKREMsWUFJQztBQUFBLFFBSkRBLFlBSUMscUNBSmMsS0FJZDtBQUFBLG1DQUhEQyxjQUdDO0FBQUEsUUFIREEsY0FHQyx1Q0FIZ0IsWUFHaEI7QUFBQSw2QkFGREMsUUFFQztBQUFBLFFBRkRBLFFBRUMsaUNBRlUsS0FFVjtBQUFBLHdCQUREQyxHQUNDO0FBQUEsUUFEREEsR0FDQyw0QkFESyxLQUNMO0FBQUE7O0FBQ0QsUUFBTUMsa0JBQWtCSixlQUFlTixXQUFmLEdBQTZCQyxXQUFyRDtBQUNBLFNBQUtVLFFBQUwsR0FBZ0JSLGVBQWVTLGFBQUdDLFlBQUgsQ0FBZ0JWLFlBQWhCLEVBQThCLE9BQTlCLENBQWYsR0FBd0RPLGVBQXhFO0FBQ0EsU0FBS0ksYUFBTCxHQUFxQkMsZUFBS0MsT0FBTCxDQUFhWixjQUFiLENBQXJCO0FBQ0EsU0FBS2EsVUFBTCxHQUFrQmxCLG1CQUFTbUIsZ0JBQVQsQ0FBMEJiLGVBQTFCLENBQWxCO0FBQ0EsU0FBS2MsR0FBTCxHQUFXYixZQUFYO0FBQ0EsU0FBS2MsVUFBTCxHQUFrQmIsY0FBbEI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFNBQUtDLEdBQUwsR0FBV0EsR0FBWDtBQUNBZCxxQkFBaUIsa0JBQXNCWSxjQUF0QixFQUFzQyxLQUFLVSxVQUEzQyxDQUFqQjtBQUNEOzs7O3dCQUVHSSxTLEVBQTBCO0FBQUEsVUFBZkMsS0FBZSx1RUFBUCxLQUFPOztBQUM1QixVQUFJQSxTQUFTLEtBQUtiLEdBQWxCLEVBQXVCO0FBQ3JCYyxnQkFBUUMsR0FBUixDQUFZSCxTQUFaO0FBQ0Q7QUFDRjs7OzRCQUVPO0FBQ04sYUFBTyxLQUFLSixVQUFMLEdBQWtCLEtBQUtBLFVBQUwsQ0FBZ0JRLEtBQWhCLEVBQWxCLEdBQTRDLElBQW5EO0FBQ0Q7Ozs7NEdBRVlDLGE7Ozs7Ozs7O3VCQUV1Qi9CLGVBQWVnQyxPQUFmLENBQXVCLEVBQUVDLE1BQU1GLGFBQVIsRUFBdkIsQzs7O0FBQTFCRyxpQzs7b0JBQ0QsQ0FBQ0EsaUI7Ozs7O3NCQUNFLElBQUlDLEtBQUosQ0FBVSwrQ0FBMkNKLGFBQTNDLHlCQUE0RUssR0FBdEYsQzs7Ozt1QkFHRixLQUFLQyxJQUFMLEU7OztBQUNBQyxtQixHQUFNQyxLQUFLRCxHQUFMLEU7QUFDTkUsZ0MsR0FBc0JGLEcsU0FBT1AsYTs7QUFDbkNVLGlDQUFPSixJQUFQLENBQVksS0FBS2xCLGFBQWpCO0FBQ0FGLDZCQUFHeUIsYUFBSCxDQUFpQnRCLGVBQUt1QixJQUFMLENBQVUsS0FBS3hCLGFBQWYsRUFBOEJxQixnQkFBOUIsQ0FBakIsRUFBa0UsS0FBS3hCLFFBQXZFO0FBQ0E7O3VCQUNNLEtBQUtNLFU7Ozs7dUJBQ29CdEIsZUFBZTRDLE1BQWYsQ0FBc0I7QUFDbkRYLHdCQUFNRixhQUQ2QztBQUVuRGMsNkJBQVdQO0FBRndDLGlCQUF0QixDOzs7QUFBekJRLGdDOztBQUlOLHFCQUFLakIsR0FBTCx3QkFBOEJFLGFBQTlCLFlBQWtELEtBQUtaLGFBQXZEO2lEQUNPMkIsZ0I7Ozs7OztBQUVQLHFCQUFLakIsR0FBTCxDQUFTLFlBQU1rQixLQUFmO0FBQ0FDOzs7Ozs7Ozs7Ozs7Ozs7OztBQUlKOzs7Ozs7Ozs7Ozs7O1lBTVVDLFMsdUVBQVksSTtZQUFNbEIsYTs7Ozs7Ozs7O3VCQUNwQixLQUFLTSxJQUFMLEU7OztxQkFFaUJOLGE7Ozs7Ozt1QkFDYi9CLGVBQWVnQyxPQUFmLENBQXVCLEVBQUVDLE1BQU1GLGFBQVIsRUFBdkIsQzs7Ozs7Ozs7O3VCQUNBL0IsZUFBZWdDLE9BQWYsR0FBeUJrQixJQUF6QixDQUE4QixFQUFFTCxXQUFXLENBQUMsQ0FBZCxFQUE5QixDOzs7Ozs7QUFGSk0sOEI7O29CQUlEQSxjOzs7OztxQkFDQ3BCLGE7Ozs7O3NCQUFxQixJQUFJcUIsY0FBSixDQUFtQiwrQ0FBbkIsQzs7O3NCQUNkLElBQUlqQixLQUFKLENBQVUsa0NBQVYsQzs7O0FBR1RrQixxQixHQUFRO0FBQ1ZSLDZCQUFXLEVBQUVTLE1BQU1ILGVBQWVOLFNBQXZCLEVBREQ7QUFFVlUseUJBQU87QUFGRyxpQjs7O0FBS1osb0JBQUlOLGFBQWEsTUFBakIsRUFBeUI7QUFDdkJJLDBCQUFRO0FBQ05SLCtCQUFXLEVBQUVXLE1BQU1MLGVBQWVOLFNBQXZCLEVBREw7QUFFTlUsMkJBQU87QUFGRCxtQkFBUjtBQUlEOztBQUVLRSw2QixHQUFnQlIsYUFBYSxJQUFiLEdBQW9CLENBQXBCLEdBQXdCLENBQUMsQzs7dUJBQ2pCakQsZUFBZTBELElBQWYsQ0FBb0JMLEtBQXBCLEVBQTJCSCxJQUEzQixDQUFnQyxFQUFFTCxXQUFXWSxhQUFiLEVBQWhDLEM7OztBQUF4QkUsK0I7O29CQUVEQSxnQkFBZ0JDLE07Ozs7O3FCQUNmLEtBQUs5QyxHOzs7OztBQUNQLHFCQUFLZSxHQUFMLENBQVMsaUNBQWlDZ0MsTUFBMUM7QUFDQSxxQkFBS2hDLEdBQUw7O3VCQUNNLEtBQUtpQyxJQUFMLEU7OztzQkFFRixJQUFJM0IsS0FBSixDQUFVLGdDQUFWLEM7OztBQUdKNEIsb0IsR0FBTyxJO0FBQ1BDLGdDLEdBQW1CLEM7QUFDbkJDLDZCLEdBQWdCLEU7Ozs7Ozs7Ozs7O0FBRVRDLG1DO0FBQ0hDLDJDLEdBQW9CL0MsZUFBS3VCLElBQUwsQ0FBVW9CLEtBQUs1QyxhQUFmLEVBQThCK0MsVUFBVUUsUUFBeEMsQztBQUNwQkMscUMsR0FBY2pELGVBQUtDLE9BQUwsQ0FBYWlELFNBQWIsRUFBd0IsS0FBeEIsRUFBK0IsY0FBL0IsQztBQUNoQkMsOEIsR0FBT3RELGFBQUdDLFlBQUgsQ0FBZ0JpRCxpQkFBaEIsQzs7QUFDWCw4QkFBSSxNQUFLM0MsR0FBVCxFQUFjO0FBQ1pnRCxvQ0FBUSxnQkFBUixFQUEwQjtBQUN4QkMsdUNBQVMsQ0FBQ0QsUUFBUSxxQkFBUixDQUFELENBRGU7QUFFeEJFLHVDQUFTLENBQUNGLFFBQVEsZ0NBQVIsQ0FBRDtBQUZlLDZCQUExQjs7QUFLQUEsb0NBQVEsZ0JBQVI7QUFDRDs7QUFFR0csNEM7OztBQUdGQSwrQ0FBcUJILFFBQVFMLGlCQUFSLENBQXJCOzs7Ozs7OztBQUVBLHVDQUFJUyxPQUFKLEdBQ0UsYUFBSUEsT0FBSixJQUFlLG1CQUFtQkMsSUFBbkIsQ0FBd0IsYUFBSUQsT0FBNUIsQ0FBZixHQUNJLG1HQURKLEdBRUksYUFBSUEsT0FIVjs7Ozs4QkFPR0QsbUJBQW1CMUIsU0FBbkIsQzs7Ozs7Z0NBQ0csSUFBSWQsS0FBSixDQUFVLFVBQU9jLFNBQVAsa0NBQTZDaUIsVUFBVUUsUUFBdkQsUUFBbUVoQyxHQUE3RSxDOzs7OztpQ0FJQSxJQUFJbkMsa0JBQUosQ0FBYSxVQUFDb0IsT0FBRCxFQUFVeUQsTUFBVixFQUFxQjtBQUN0QyxnQ0FBTUMsY0FBZUosbUJBQW1CMUIsU0FBbkIsRUFBOEIrQixJQUE5QixDQUNuQixNQUFLMUQsVUFBTCxDQUFnQjJELEtBQWhCLENBQXNCQyxJQUF0QixDQUEyQixNQUFLNUQsVUFBaEMsQ0FEbUIsRUFFbkIsU0FBUzZELFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCO0FBQ3JCLGtDQUFJQSxHQUFKLEVBQVMsT0FBT04sT0FBT00sR0FBUCxDQUFQO0FBQ1QvRDtBQUNELDZCQUxrQixDQUFyQjs7QUFRQSxnQ0FBSTBELGVBQWUsT0FBT0EsWUFBWU0sSUFBbkIsS0FBNEIsVUFBL0MsRUFBMkQ7QUFDekROLDBDQUFZTSxJQUFaLENBQWlCaEUsT0FBakIsRUFBMEJpRSxLQUExQixDQUFnQ1IsTUFBaEM7QUFDRDtBQUNGLDJCQVpLLEM7Ozs7QUFjTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBS2pELEdBQUwsQ0FBUyxDQUFHb0IsVUFBVXNDLFdBQVYsRUFBSCxXQUFpQ3RDLGFBQWEsSUFBYixHQUFvQixPQUFwQixHQUE4QixLQUEvRCxXQUE0RWlCLFVBQVVFLFFBQXRGLE9BQVQ7OztpQ0FFTXBFLGVBQWV3RixLQUFmLENBQXFCLEVBQUV2RCxNQUFNaUMsVUFBVWpDLElBQWxCLEVBQXJCLEVBQStDd0QsTUFBL0MsQ0FBc0QsRUFBRUMsTUFBTSxFQUFFbkMsT0FBT04sU0FBVCxFQUFSLEVBQXRELEM7OztBQUNOZ0Isd0NBQWMwQixJQUFkLENBQW1CekIsVUFBVTBCLE1BQVYsRUFBbkI7QUFDQTVCOzs7Ozs7OztBQUVBcEMsa0NBQVFpRSxLQUFSO0FBQ0EsZ0NBQUtoRSxHQUFMLENBQVMsOEJBQTJCcUMsVUFBVWpDLElBQXJDLHdCQUE2REcsR0FBdEU7QUFDQSxnQ0FBS1AsR0FBTCxDQUFTLDZEQUE2RE8sR0FBdEU7Z0NBQ00sd0JBQWVELEtBQWYsa0JBQTZCLElBQUlBLEtBQUosYzs7Ozs7Ozs7O3VEQXJFZndCLGU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlFeEIsb0JBQUlBLGdCQUFnQkMsTUFBaEIsSUFBMEJJLGdCQUE5QixFQUFnRCxLQUFLbkMsR0FBTCxDQUFTLHdDQUF3Q2lFLEtBQWpEO2tEQUN6QzdCLGE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR1Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRVThCLHNDLEdBQXlCOUUsYUFBRytFLFdBQUgsQ0FBZSxLQUFLN0UsYUFBcEIsQzs7dUJBQ0luQixlQUFlMEQsSUFBZixDQUFvQixFQUFwQixDOzs7QUFBN0J1QyxvQzs7QUFDTjtBQUNNQyxrQyxHQUFxQkMsaUJBQUVDLE1BQUYsQ0FBU0wsc0JBQVQsRUFBaUM7QUFBQSx5QkFBUSxtQkFBa0JsQixJQUFsQixDQUF1QndCLElBQXZCO0FBQVI7QUFBQSxpQkFBakMsRUFBdUVDLEdBQXZFLENBQTJFLG9CQUFZO0FBQ2hILHNCQUFNQyxnQkFBZ0JDLFNBQVNwQyxTQUFTcUMsS0FBVCxDQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBVCxDQUF0QjtBQUNBLHNCQUFNQyxtQkFBbUJULHFCQUFxQlUsSUFBckIsQ0FBMEI7QUFBQSwyQkFBS3ZDLFlBQVl3QyxFQUFFeEMsUUFBbkI7QUFBQSxtQkFBMUIsQ0FBekI7QUFDQSx5QkFBTyxFQUFFdkIsV0FBVzBELGFBQWIsRUFBNEJuQyxrQkFBNUIsRUFBc0NzQyxrQ0FBdEMsRUFBUDtBQUNELGlCQUowQixDO0FBTXJCRyw0QixHQUFlVixpQkFBRUMsTUFBRixDQUFTRixrQkFBVCxFQUE2QixFQUFFUSxrQkFBa0IsS0FBcEIsRUFBN0IsRUFBMERKLEdBQTFELENBQThEO0FBQUEseUJBQUtRLEVBQUUxQyxRQUFQO0FBQUEsaUJBQTlELEM7QUFDakIyQyxrQyxHQUFxQkYsWTs7QUFDekIscUJBQUtoRixHQUFMLENBQVMsdURBQVQ7O3NCQUNJLENBQUMsS0FBS2hCLFFBQU4sSUFBa0JrRyxtQkFBbUJuRCxNOzs7Ozs7dUJBQ2pCLElBQUkzRCxrQkFBSixDQUFZLFVBQVNvQixPQUFULEVBQWtCO0FBQ2xEMkYscUNBQUlDLE1BQUosQ0FDRTtBQUNFQywwQkFBTSxVQURSO0FBRUV0Qyw2QkFDRSx1SUFISjtBQUlFM0MsMEJBQU0sb0JBSlI7QUFLRWtGLDZCQUFTTjtBQUxYLG1CQURGLEVBUUUsbUJBQVc7QUFDVHhGLDRCQUFRK0YsT0FBUjtBQUNELG1CQVZIO0FBWUQsaUJBYnFCLEM7OztBQUFoQkEsdUI7OztBQWVOTCxxQ0FBcUJLLFFBQVFMLGtCQUE3Qjs7O2tEQUdLOUcsbUJBQVFxRyxHQUFSLENBQVlTLGtCQUFaLEVBQWdDLDZCQUFxQjtBQUMxRCxzQkFBTU0sV0FBV2pHLGVBQUt1QixJQUFMLENBQVUsT0FBS3hCLGFBQWYsRUFBOEJtRyxpQkFBOUIsQ0FBakI7QUFBQSxzQkFDRUMsMEJBQTBCRCxrQkFBa0JFLE9BQWxCLENBQTBCLEdBQTFCLENBRDVCO0FBQUEsc0JBRUVDLFlBQVlILGtCQUFrQkksS0FBbEIsQ0FBd0IsQ0FBeEIsRUFBMkJILHVCQUEzQixDQUZkO0FBQUEsc0JBR0V4RixnQkFBZ0J1RixrQkFBa0JJLEtBQWxCLENBQXdCSCwwQkFBMEIsQ0FBbEQsRUFBcURELGtCQUFrQkssV0FBbEIsQ0FBOEIsR0FBOUIsQ0FBckQsQ0FIbEI7O0FBS0EseUJBQUs5RixHQUFMLENBQVMsc0JBQW9Cd0YsUUFBcEIsa0RBQTJFLE9BQU9qRixHQUEzRjtBQUNBLHlCQUFPcEMsZUFBZTRDLE1BQWYsQ0FBc0I7QUFDM0JYLDBCQUFNRixhQURxQjtBQUUzQmMsK0JBQVc0RTtBQUZnQixtQkFBdEIsRUFHSnBDLElBSEksQ0FHQztBQUFBLDJCQUFvQnVDLGlCQUFpQmhDLE1BQWpCLEVBQXBCO0FBQUEsbUJBSEQsQ0FBUDtBQUlELGlCQVhNLEM7Ozs7OztBQWFQLHFCQUFLL0QsR0FBTCxDQUFTLGdGQUFnRk8sR0FBekY7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtKOzs7Ozs7Ozs7Ozs7Ozs7QUFNVTJELHNDLEdBQXlCOUUsYUFBRytFLFdBQUgsQ0FBZSxLQUFLN0UsYUFBcEIsQzs7dUJBQ0luQixlQUFlMEQsSUFBZixDQUFvQixFQUFwQixFQUF3Qm1FLElBQXhCLEU7OztBQUE3QjVCLG9DOztBQUNOO0FBQ01DLGtDLEdBQXFCQyxpQkFBRUMsTUFBRixDQUFTTCxzQkFBVCxFQUFpQztBQUFBLHlCQUFRLGtCQUFpQmxCLElBQWpCLENBQXNCd0IsSUFBdEI7QUFBUjtBQUFBLGlCQUFqQyxFQUFzRUMsR0FBdEUsQ0FBMEUsb0JBQVk7QUFDL0csc0JBQU1DLGdCQUFnQkMsU0FBU3BDLFNBQVNxQyxLQUFULENBQWUsR0FBZixFQUFvQixDQUFwQixDQUFULENBQXRCO0FBQ0Esc0JBQU1DLG1CQUFtQixDQUFDLENBQUNQLGlCQUFFekMsSUFBRixDQUFPdUMsb0JBQVAsRUFBNkIsRUFBRXBELFdBQVcsSUFBSU4sSUFBSixDQUFTZ0UsYUFBVCxDQUFiLEVBQTdCLENBQTNCO0FBQ0EseUJBQU8sRUFBRTFELFdBQVcwRCxhQUFiLEVBQTRCbkMsa0JBQTVCLEVBQXNDc0Msa0NBQXRDLEVBQVA7QUFDRCxpQkFKMEIsQztBQU1yQm9CLG1DLEdBQXNCM0IsaUJBQUVDLE1BQUYsQ0FBU0gsb0JBQVQsRUFBK0IsYUFBSztBQUM5RCx5QkFBTyxDQUFDRSxpQkFBRXpDLElBQUYsQ0FBT3dDLGtCQUFQLEVBQTJCLEVBQUU5QixVQUFVd0MsRUFBRXhDLFFBQWQsRUFBM0IsQ0FBUjtBQUNELGlCQUYyQixDO0FBSXhCMkQsa0MsR0FBcUJELG9CQUFvQnhCLEdBQXBCLENBQXdCO0FBQUEseUJBQUtNLEVBQUUzRSxJQUFQO0FBQUEsaUJBQXhCLEM7O3NCQUVyQixDQUFDLEtBQUtwQixRQUFOLElBQWtCLENBQUMsQ0FBQ2tILG1CQUFtQm5FLE07Ozs7Ozt1QkFDbkIsSUFBSTNELGtCQUFKLENBQVksVUFBU29CLE9BQVQsRUFBa0I7QUFDbEQyRixxQ0FBSUMsTUFBSixDQUNFO0FBQ0VDLDBCQUFNLFVBRFI7QUFFRXRDLDZCQUNFLDJJQUhKO0FBSUUzQywwQkFBTSxvQkFKUjtBQUtFa0YsNkJBQVNZO0FBTFgsbUJBREYsRUFRRSxtQkFBVztBQUNUMUcsNEJBQVErRixPQUFSO0FBQ0QsbUJBVkg7QUFZRCxpQkFicUIsQzs7O0FBQWhCQSx1Qjs7O0FBZU5XLHFDQUFxQlgsUUFBUVcsa0JBQTdCOzs7O3VCQUdtQy9ILGVBQWUwRCxJQUFmLENBQW9CO0FBQ3ZEekIsd0JBQU0sRUFBRStGLEtBQUtELGtCQUFQO0FBRGlELGlCQUFwQixFQUVsQ0YsSUFGa0MsRTs7O0FBQS9CSSxzQzs7cUJBSUZGLG1CQUFtQm5FLE07Ozs7O0FBQ3JCLHFCQUFLL0IsR0FBTCwyQkFBbUMsTUFBR2tHLG1CQUFtQnBGLElBQW5CLENBQXdCLElBQXhCLENBQUgsRUFBbUN1RixJQUF0RTs7dUJBQ01sSSxlQUFlbUksTUFBZixDQUFzQjtBQUMxQmxHLHdCQUFNLEVBQUUrRixLQUFLRCxrQkFBUDtBQURvQixpQkFBdEIsQzs7O2tEQUtERSxzQjs7Ozs7O0FBRVAscUJBQUtwRyxHQUFMLENBQVMsdURBQXVETyxHQUFoRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0o7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBVVEsS0FBS0MsSUFBTCxFOzs7O3VCQUNtQnJDLGVBQWUwRCxJQUFmLEdBQXNCUixJQUF0QixDQUEyQixFQUFFTCxXQUFXLENBQWIsRUFBM0IsQzs7O0FBQW5CdUYsMEI7O0FBQ04sb0JBQUksQ0FBQ0EsV0FBV3hFLE1BQWhCLEVBQXdCLEtBQUsvQixHQUFMLENBQVMsbUNBQW1DZ0MsTUFBNUM7a0RBQ2pCdUUsV0FBVzlCLEdBQVgsQ0FBZSxhQUFLO0FBQ3pCLHlCQUFLekUsR0FBTCxDQUFTLE9BQUcrRSxFQUFFckQsS0FBRixJQUFXLElBQVgsR0FBa0IsU0FBbEIsR0FBOEIsU0FBakMsR0FBNkNxRCxFQUFFckQsS0FBRixJQUFXLElBQVgsR0FBa0IsT0FBbEIsR0FBNEIsS0FBekUsV0FBc0ZxRCxFQUFFeEMsUUFBeEYsQ0FBVDtBQUNBLHlCQUFPd0MsRUFBRWhCLE1BQUYsRUFBUDtBQUNELGlCQUhNLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQXBUVXJGLFE7OztBQTJUckIsU0FBU3lDLFlBQVQsQ0FBc0I2QyxLQUF0QixFQUE2QjtBQUMzQixNQUFJQSxTQUFTQSxNQUFNdEIsSUFBTixJQUFjLFFBQTNCLEVBQXFDO0FBQ25DLFVBQU0sSUFBSW5CLGNBQUoseUNBQXdEeUMsTUFBTXpFLElBQTlELFFBQU47QUFDRDtBQUNGOztBQUVEaUgsT0FBT0MsT0FBUCxHQUFpQi9ILFFBQWpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAnY29sb3JzJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGFzayBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCBNaWdyYXRpb25Nb2RlbEZhY3RvcnkgZnJvbSAnLi9kYic7XG5sZXQgTWlncmF0aW9uTW9kZWw7XG5cblByb21pc2UuY29uZmlnKHtcbiAgd2FybmluZ3M6IHRydWVcbn0pO1xuXG5tb25nb29zZS5Qcm9taXNlID0gUHJvbWlzZTtcblxuY29uc3QgZXM2VGVtcGxhdGUgPSBgXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXAgKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgdGhhdCBVTkRPIHRoZSB1cCBmdW5jdGlvbiBzaWRlIGVmZmVjdHMgaGVyZSAoaWYgcG9zc2libGUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3duICgpIHtcbiAgLy8gV3JpdGUgbWlncmF0aW9uIGhlcmVcbn1cbmA7XG5cbmNvbnN0IGVzNVRlbXBsYXRlID0gYCd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHlvdSBuZWVkIHRvIG1ha2UgdG8gdGhlIGRhdGFiYXNlIGhlcmVcbiAqL1xuZXhwb3J0cy51cCA9IGZ1bmN0aW9uIHVwIChkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0cy5kb3duID0gZnVuY3Rpb24gZG93bihkb25lKSB7XG4gIGRvbmUoKTtcbn07XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWdyYXRvciB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0ZW1wbGF0ZVBhdGgsXG4gICAgbWlncmF0aW9uc1BhdGggPSAnLi9taWdyYXRpb25zJyxcbiAgICBkYkNvbm5lY3Rpb25VcmksXG4gICAgZXM2VGVtcGxhdGVzID0gZmFsc2UsXG4gICAgY29sbGVjdGlvbk5hbWUgPSAnbWlncmF0aW9ucycsXG4gICAgYXV0b3N5bmMgPSBmYWxzZSxcbiAgICBjbGkgPSBmYWxzZVxuICB9KSB7XG4gICAgY29uc3QgZGVmYXVsdFRlbXBsYXRlID0gZXM2VGVtcGxhdGVzID8gZXM2VGVtcGxhdGUgOiBlczVUZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGVQYXRoID8gZnMucmVhZEZpbGVTeW5jKHRlbXBsYXRlUGF0aCwgJ3V0Zi04JykgOiBkZWZhdWx0VGVtcGxhdGU7XG4gICAgdGhpcy5taWdyYXRpb25QYXRoID0gcGF0aC5yZXNvbHZlKG1pZ3JhdGlvbnNQYXRoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBtb25nb29zZS5jcmVhdGVDb25uZWN0aW9uKGRiQ29ubmVjdGlvblVyaSk7XG4gICAgdGhpcy5lczYgPSBlczZUZW1wbGF0ZXM7XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvbk5hbWU7XG4gICAgdGhpcy5hdXRvc3luYyA9IGF1dG9zeW5jO1xuICAgIHRoaXMuY2xpID0gY2xpO1xuICAgIE1pZ3JhdGlvbk1vZGVsID0gTWlncmF0aW9uTW9kZWxGYWN0b3J5KGNvbGxlY3Rpb25OYW1lLCB0aGlzLmNvbm5lY3Rpb24pO1xuICB9XG5cbiAgbG9nKGxvZ1N0cmluZywgZm9yY2UgPSBmYWxzZSkge1xuICAgIGlmIChmb3JjZSB8fCB0aGlzLmNsaSkge1xuICAgICAgY29uc29sZS5sb2cobG9nU3RyaW5nKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uID8gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCkgOiBudWxsO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlKG1pZ3JhdGlvbk5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXhpc3RpbmdNaWdyYXRpb24gPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kT25lKHsgbmFtZTogbWlncmF0aW9uTmFtZSB9KTtcbiAgICAgIGlmICghIWV4aXN0aW5nTWlncmF0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlcmUgaXMgYWxyZWFkeSBhIG1pZ3JhdGlvbiB3aXRoIG5hbWUgJyR7bWlncmF0aW9uTmFtZX0nIGluIHRoZSBkYXRhYmFzZWAucmVkKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5zeW5jKCk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgY29uc3QgbmV3TWlncmF0aW9uRmlsZSA9IGAke25vd30tJHttaWdyYXRpb25OYW1lfS5qc2A7XG4gICAgICBta2RpcnAuc3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5taWdyYXRpb25QYXRoLCBuZXdNaWdyYXRpb25GaWxlKSwgdGhpcy50ZW1wbGF0ZSk7XG4gICAgICAvLyBjcmVhdGUgaW5zdGFuY2UgaW4gZGJcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkNyZWF0ZWQgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICBuYW1lOiBtaWdyYXRpb25OYW1lLFxuICAgICAgICBjcmVhdGVkQXQ6IG5vd1xuICAgICAgfSk7XG4gICAgICB0aGlzLmxvZyhgQ3JlYXRlZCBtaWdyYXRpb24gJHttaWdyYXRpb25OYW1lfSBpbiAke3RoaXMubWlncmF0aW9uUGF0aH0uYCk7XG4gICAgICByZXR1cm4gbWlncmF0aW9uQ3JlYXRlZDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coZXJyb3Iuc3RhY2spO1xuICAgICAgZmlsZVJlcXVpcmVkKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBtaWdyYXRpb25zIHVwIHRvIG9yIGRvd24gdG8gYSBnaXZlbiBtaWdyYXRpb24gbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gbWlncmF0aW9uTmFtZVxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXG4gICAqL1xuICBhc3luYyBydW4oZGlyZWN0aW9uID0gJ3VwJywgbWlncmF0aW9uTmFtZSkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuXG4gICAgY29uc3QgdW50aWxNaWdyYXRpb24gPSBtaWdyYXRpb25OYW1lXG4gICAgICA/IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoeyBuYW1lOiBtaWdyYXRpb25OYW1lIH0pXG4gICAgICA6IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoKS5zb3J0KHsgY3JlYXRlZEF0OiAtMSB9KTtcblxuICAgIGlmICghdW50aWxNaWdyYXRpb24pIHtcbiAgICAgIGlmIChtaWdyYXRpb25OYW1lKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoYXQgbWlncmF0aW9uIGluIHRoZSBkYXRhYmFzZScpO1xuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGFyZSBubyBwZW5kaW5nIG1pZ3JhdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgbGV0IHF1ZXJ5ID0ge1xuICAgICAgY3JlYXRlZEF0OiB7ICRsdGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdCB9LFxuICAgICAgc3RhdGU6ICdkb3duJ1xuICAgIH07XG5cbiAgICBpZiAoZGlyZWN0aW9uID09ICdkb3duJykge1xuICAgICAgcXVlcnkgPSB7XG4gICAgICAgIGNyZWF0ZWRBdDogeyAkZ3RlOiB1bnRpbE1pZ3JhdGlvbi5jcmVhdGVkQXQgfSxcbiAgICAgICAgc3RhdGU6ICd1cCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydERpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSAndXAnID8gMSA6IC0xO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmQocXVlcnkpLnNvcnQoeyBjcmVhdGVkQXQ6IHNvcnREaXJlY3Rpb24gfSk7XG5cbiAgICBpZiAoIW1pZ3JhdGlvbnNUb1J1bi5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmNsaSkge1xuICAgICAgICB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gcnVuJy55ZWxsb3cpO1xuICAgICAgICB0aGlzLmxvZyhgQ3VycmVudCBNaWdyYXRpb25zJyBTdGF0dXNlczogYCk7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdCgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nKTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IG51bU1pZ3JhdGlvbnNSYW4gPSAwO1xuICAgIGxldCBtaWdyYXRpb25zUmFuID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1pZ3JhdGlvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbkZpbGVQYXRoID0gcGF0aC5qb2luKHNlbGYubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uLmZpbGVuYW1lKTtcbiAgICAgIGNvbnN0IG1vZHVsZXNQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsICdub2RlX21vZHVsZXMnKTtcbiAgICAgIGxldCBjb2RlID0gZnMucmVhZEZpbGVTeW5jKG1pZ3JhdGlvbkZpbGVQYXRoKTtcbiAgICAgIGlmICh0aGlzLmVzNikge1xuICAgICAgICByZXF1aXJlKCdiYWJlbC1yZWdpc3RlcicpKHtcbiAgICAgICAgICBwcmVzZXRzOiBbcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWxhdGVzdCcpXSxcbiAgICAgICAgICBwbHVnaW5zOiBbcmVxdWlyZSgnYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1ydW50aW1lJyldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXBvbHlmaWxsJyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBtaWdyYXRpb25GdW5jdGlvbnM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG1pZ3JhdGlvbkZ1bmN0aW9ucyA9IHJlcXVpcmUobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGVyci5tZXNzYWdlID1cbiAgICAgICAgICBlcnIubWVzc2FnZSAmJiAvVW5leHBlY3RlZCB0b2tlbi8udGVzdChlcnIubWVzc2FnZSlcbiAgICAgICAgICAgID8gJ1VuZXhwZWN0ZWQgVG9rZW4gd2hlbiBwYXJzaW5nIG1pZ3JhdGlvbi4gSWYgeW91IGFyZSB1c2luZyBhbiBFUzYgbWlncmF0aW9uIGZpbGUsIHVzZSBvcHRpb24gLS1lczYnXG4gICAgICAgICAgICA6IGVyci5tZXNzYWdlO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG5cbiAgICAgIGlmICghbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJHtkaXJlY3Rpb259IGV4cG9ydCBpcyBub3QgZGVmaW5lZCBpbiAke21pZ3JhdGlvbi5maWxlbmFtZX0uYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ubW9kZWwuYmluZCh0aGlzLmNvbm5lY3Rpb24pLFxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2soZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoY2FsbFByb21pc2UgJiYgdHlwZW9mIGNhbGxQcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxQcm9taXNlLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgIC8vICAgdGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSxcbiAgICAgICAgLy8gICBlcnIgPT4ge1xuICAgICAgICAvLyAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAvLyAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgKGNhbGxQcm9taXNlICYmIHR5cGVvZiBjYWxsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICAgYXdhaXQgY2FsbFByb21pc2VcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGNvbnN0IGNhbGxQcm9taXNlID0gbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl07XG4gICAgICAgIC8vIGNhbGxQcm9taXNlLmJpbmQodGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSk7XG4gICAgICAgIC8vIGF3YWl0IGNhbGxQcm9taXNlKCk7XG5cbiAgICAgICAgdGhpcy5sb2coYCR7ZGlyZWN0aW9uLnRvVXBwZXJDYXNlKCl9OiAgIGBbZGlyZWN0aW9uID09ICd1cCcgPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke21pZ3JhdGlvbi5maWxlbmFtZX0gYCk7XG5cbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwud2hlcmUoeyBuYW1lOiBtaWdyYXRpb24ubmFtZSB9KS51cGRhdGUoeyAkc2V0OiB7IHN0YXRlOiBkaXJlY3Rpb24gfSB9KTtcbiAgICAgICAgbWlncmF0aW9uc1Jhbi5wdXNoKG1pZ3JhdGlvbi50b0pTT04oKSk7XG4gICAgICAgIG51bU1pZ3JhdGlvbnNSYW4rKztcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHRoaXMubG9nKGBGYWlsZWQgdG8gcnVuIG1pZ3JhdGlvbiAke21pZ3JhdGlvbi5uYW1lfSBkdWUgdG8gYW4gZXJyb3IuYC5yZWQpO1xuICAgICAgICB0aGlzLmxvZyhgTm90IGNvbnRpbnVpbmcuIE1ha2Ugc3VyZSB5b3VyIGRhdGEgaXMgaW4gY29uc2lzdGVudCBzdGF0ZWAucmVkKTtcbiAgICAgICAgdGhyb3cgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWlncmF0aW9uc1RvUnVuLmxlbmd0aCA9PSBudW1NaWdyYXRpb25zUmFuKSB0aGlzLmxvZygnQWxsIG1pZ3JhdGlvbnMgZmluaXNoZWQgc3VjY2Vzc2Z1bGx5LicuZ3JlZW4pO1xuICAgIHJldHVybiBtaWdyYXRpb25zUmFuO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2tzIGF0IHRoZSBmaWxlIHN5c3RlbSBtaWdyYXRpb25zIGFuZCBpbXBvcnRzIGFueSBtaWdyYXRpb25zIHRoYXQgYXJlXG4gICAqIG9uIHRoZSBmaWxlIHN5c3RlbSBidXQgbWlzc2luZyBpbiB0aGUgZGF0YWJhc2UgaW50byB0aGUgZGF0YWJhc2VcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9wcG9zaXRlIG9mIHBydW5lKClcbiAgICovXG4gIGFzeW5jIHN5bmMoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIgPSBmcy5yZWFkZGlyU3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgY29uc3QgbWlncmF0aW9uc0luRGF0YWJhc2UgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHt9KTtcbiAgICAgIC8vIEdvIG92ZXIgbWlncmF0aW9ucyBpbiBmb2xkZXIgYW5kIGRlbGV0ZSBhbnkgZmlsZXMgbm90IGluIERCXG4gICAgICBjb25zdCBtaWdyYXRpb25zSW5Gb2xkZXIgPSBfLmZpbHRlcihmaWxlc0luTWlncmF0aW9uRm9sZGVyLCBmaWxlID0+IC9cXGR7MTMsfVxcLS4rLmpzJC8udGVzdChmaWxlKSkubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUNyZWF0ZWRBdCA9IHBhcnNlSW50KGZpbGVuYW1lLnNwbGl0KCctJylbMF0pO1xuICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gbWlncmF0aW9uc0luRGF0YWJhc2Uuc29tZShtID0+IGZpbGVuYW1lID09IG0uZmlsZW5hbWUpO1xuICAgICAgICByZXR1cm4geyBjcmVhdGVkQXQ6IGZpbGVDcmVhdGVkQXQsIGZpbGVuYW1lLCBleGlzdHNJbkRhdGFiYXNlIH07XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZmlsZXNOb3RJbkRiID0gXy5maWx0ZXIobWlncmF0aW9uc0luRm9sZGVyLCB7IGV4aXN0c0luRGF0YWJhc2U6IGZhbHNlIH0pLm1hcChmID0+IGYuZmlsZW5hbWUpO1xuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGZpbGVzTm90SW5EYjtcbiAgICAgIHRoaXMubG9nKCdTeW5jaHJvbml6aW5nIGRhdGFiYXNlIHdpdGggZmlsZSBzeXN0ZW0gbWlncmF0aW9ucy4uLicpO1xuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmIG1pZ3JhdGlvbnNUb0ltcG9ydC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICBhc2sucHJvbXB0KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICAgICdUaGUgZm9sbG93aW5nIG1pZ3JhdGlvbnMgZXhpc3QgaW4gdGhlIG1pZ3JhdGlvbnMgZm9sZGVyIGJ1dCBub3QgaW4gdGhlIGRhdGFiYXNlLiBTZWxlY3QgdGhlIG9uZXMgeW91IHdhbnQgdG8gaW1wb3J0IGludG8gdGhlIGRhdGFiYXNlJyxcbiAgICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0ltcG9ydCcsXG4gICAgICAgICAgICAgIGNob2ljZXM6IGZpbGVzTm90SW5EYlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuc3dlcnMgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKGFuc3dlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0ltcG9ydCA9IGFuc3dlcnMubWlncmF0aW9uc1RvSW1wb3J0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5tYXAobWlncmF0aW9uc1RvSW1wb3J0LCBtaWdyYXRpb25Ub0ltcG9ydCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRoaXMubWlncmF0aW9uUGF0aCwgbWlncmF0aW9uVG9JbXBvcnQpLFxuICAgICAgICAgIHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ID0gbWlncmF0aW9uVG9JbXBvcnQuaW5kZXhPZignLScpLFxuICAgICAgICAgIHRpbWVzdGFtcCA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKDAsIHRpbWVzdGFtcFNlcGFyYXRvckluZGV4KSxcbiAgICAgICAgICBtaWdyYXRpb25OYW1lID0gbWlncmF0aW9uVG9JbXBvcnQuc2xpY2UodGltZXN0YW1wU2VwYXJhdG9ySW5kZXggKyAxLCBtaWdyYXRpb25Ub0ltcG9ydC5sYXN0SW5kZXhPZignLicpKTtcblxuICAgICAgICB0aGlzLmxvZyhgQWRkaW5nIG1pZ3JhdGlvbiAke2ZpbGVQYXRofSBpbnRvIGRhdGFiYXNlIGZyb20gZmlsZSBzeXN0ZW0uIFN0YXRlIGlzIGAgKyBgRE9XTmAucmVkKTtcbiAgICAgICAgcmV0dXJuIE1pZ3JhdGlvbk1vZGVsLmNyZWF0ZSh7XG4gICAgICAgICAgbmFtZTogbWlncmF0aW9uTmFtZSxcbiAgICAgICAgICBjcmVhdGVkQXQ6IHRpbWVzdGFtcFxuICAgICAgICB9KS50aGVuKGNyZWF0ZWRNaWdyYXRpb24gPT4gY3JlYXRlZE1pZ3JhdGlvbi50b0pTT04oKSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBzeW5jaHJvbmlzZSBtaWdyYXRpb25zIGluIHRoZSBtaWdyYXRpb25zIGZvbGRlciB1cCB0byB0aGUgZGF0YWJhc2UuYC5yZWQpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wcG9zaXRlIG9mIHN5bmMoKS5cbiAgICogUmVtb3ZlcyBmaWxlcyBpbiBtaWdyYXRpb24gZGlyZWN0b3J5IHdoaWNoIGRvbid0IGV4aXN0IGluIGRhdGFiYXNlLlxuICAgKi9cbiAgYXN5bmMgcHJ1bmUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIgPSBmcy5yZWFkZGlyU3luYyh0aGlzLm1pZ3JhdGlvblBhdGgpO1xuICAgICAgY29uc3QgbWlncmF0aW9uc0luRGF0YWJhc2UgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHt9KS5sZWFuKCk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcy8udGVzdChmaWxlKSkubWFwKGZpbGVuYW1lID0+IHtcbiAgICAgICAgY29uc3QgZmlsZUNyZWF0ZWRBdCA9IHBhcnNlSW50KGZpbGVuYW1lLnNwbGl0KCctJylbMF0pO1xuICAgICAgICBjb25zdCBleGlzdHNJbkRhdGFiYXNlID0gISFfLmZpbmQobWlncmF0aW9uc0luRGF0YWJhc2UsIHsgY3JlYXRlZEF0OiBuZXcgRGF0ZShmaWxlQ3JlYXRlZEF0KSB9KTtcbiAgICAgICAgcmV0dXJuIHsgY3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGRiTWlncmF0aW9uc05vdE9uRnMgPSBfLmZpbHRlcihtaWdyYXRpb25zSW5EYXRhYmFzZSwgbSA9PiB7XG4gICAgICAgIHJldHVybiAhXy5maW5kKG1pZ3JhdGlvbnNJbkZvbGRlciwgeyBmaWxlbmFtZTogbS5maWxlbmFtZSB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgbWlncmF0aW9uc1RvRGVsZXRlID0gZGJNaWdyYXRpb25zTm90T25Gcy5tYXAobSA9PiBtLm5hbWUpO1xuXG4gICAgICBpZiAoIXRoaXMuYXV0b3N5bmMgJiYgISFtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBkYXRhYmFzZSBidXQgbm90IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlci4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIHJlbW92ZSBmcm9tIHRoZSBmaWxlIHN5c3RlbS4nLFxuICAgICAgICAgICAgICBuYW1lOiAnbWlncmF0aW9uc1RvRGVsZXRlJyxcbiAgICAgICAgICAgICAgY2hvaWNlczogbWlncmF0aW9uc1RvRGVsZXRlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5zd2VycyA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoYW5zd2Vycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWlncmF0aW9uc1RvRGVsZXRlID0gYW5zd2Vycy5taWdyYXRpb25zVG9EZWxldGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb0RlbGV0ZURvY3MgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKHtcbiAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICB9KS5sZWFuKCk7XG5cbiAgICAgIGlmIChtaWdyYXRpb25zVG9EZWxldGUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMubG9nKGBSZW1vdmluZyBtaWdyYXRpb24ocykgYCwgYCR7bWlncmF0aW9uc1RvRGVsZXRlLmpvaW4oJywgJyl9YC5jeWFuLCBgIGZyb20gZGF0YWJhc2VgKTtcbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwucmVtb3ZlKHtcbiAgICAgICAgICBuYW1lOiB7ICRpbjogbWlncmF0aW9uc1RvRGVsZXRlIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtaWdyYXRpb25zVG9EZWxldGVEb2NzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhgQ291bGQgbm90IHBydW5lIGV4dHJhbmVvdXMgbWlncmF0aW9ucyBmcm9tIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0aGUgY3VycmVudCBtaWdyYXRpb25zIGFuZCB0aGVpciBzdGF0dXNlc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheTxPYmplY3Q+Pn1cbiAgICogQGV4YW1wbGVcbiAgICogICBbXG4gICAqICAgIHsgbmFtZTogJ215LW1pZ3JhdGlvbicsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDI0X215LW1pZ3JhdGlvbi5qcycsIHN0YXRlOiAndXAnIH0sXG4gICAqICAgIHsgbmFtZTogJ2FkZC1jb3dzJywgZmlsZW5hbWU6ICcxNDkyMTMyMjM0NTNfYWRkLWNvd3MuanMnLCBzdGF0ZTogJ2Rvd24nIH1cbiAgICogICBdXG4gICAqL1xuICBhc3luYyBsaXN0KCkge1xuICAgIGF3YWl0IHRoaXMuc3luYygpO1xuICAgIGNvbnN0IG1pZ3JhdGlvbnMgPSBhd2FpdCBNaWdyYXRpb25Nb2RlbC5maW5kKCkuc29ydCh7IGNyZWF0ZWRBdDogMSB9KTtcbiAgICBpZiAoIW1pZ3JhdGlvbnMubGVuZ3RoKSB0aGlzLmxvZygnVGhlcmUgYXJlIG5vIG1pZ3JhdGlvbnMgdG8gbGlzdC4nLnllbGxvdyk7XG4gICAgcmV0dXJuIG1pZ3JhdGlvbnMubWFwKG0gPT4ge1xuICAgICAgdGhpcy5sb2coYCR7bS5zdGF0ZSA9PSAndXAnID8gJ1VQOiAgXFx0JyA6ICdET1dOOlxcdCd9YFttLnN0YXRlID09ICd1cCcgPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke20uZmlsZW5hbWV9YCk7XG4gICAgICByZXR1cm4gbS50b0pTT04oKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaWxlUmVxdWlyZWQoZXJyb3IpIHtcbiAgaWYgKGVycm9yICYmIGVycm9yLmNvZGUgPT0gJ0VOT0VOVCcpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYENvdWxkIG5vdCBmaW5kIGFueSBmaWxlcyBhdCBwYXRoICcke2Vycm9yLnBhdGh9J2ApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWlncmF0b3I7XG4iXX0=