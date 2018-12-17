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
                  _context2.next = 76;
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
                _context2.next = 73;
                break;

              case 68:
                _context2.prev = 68;
                _context2.t2 = _context2['catch'](56);

                this.log(('Failed to run migration ' + migration.name + ' due to an error.').red);
                this.log('Not continuing. Make sure your data is in consistent state'.red);
                throw _context2.t2 instanceof Error ? _context2.t2 : new Error(_context2.t2);

              case 73:
                _iteratorNormalCompletion = true;
                _context2.next = 39;
                break;

              case 76:
                _context2.next = 82;
                break;

              case 78:
                _context2.prev = 78;
                _context2.t3 = _context2['catch'](37);
                _didIteratorError = true;
                _iteratorError = _context2.t3;

              case 82:
                _context2.prev = 82;
                _context2.prev = 83;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 85:
                _context2.prev = 85;

                if (!_didIteratorError) {
                  _context2.next = 88;
                  break;
                }

                throw _iteratorError;

              case 88:
                return _context2.finish(85);

              case 89:
                return _context2.finish(82);

              case 90:

                if (migrationsToRun.length == numMigrationsRan) this.log('All migrations finished successfully.'.green);
                return _context2.abrupt('return', migrationsRan);

              case 92:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[37, 78, 82, 90], [46, 50], [56, 68], [83,, 85, 89]]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIuanMiXSwibmFtZXMiOlsiTWlncmF0aW9uTW9kZWwiLCJQcm9taXNlIiwiY29uZmlnIiwid2FybmluZ3MiLCJlczZUZW1wbGF0ZSIsImVzNVRlbXBsYXRlIiwiTWlncmF0b3IiLCJ0ZW1wbGF0ZVBhdGgiLCJtaWdyYXRpb25zUGF0aCIsImRiQ29ubmVjdGlvblVyaSIsImVzNlRlbXBsYXRlcyIsImNvbGxlY3Rpb25OYW1lIiwiYXV0b3N5bmMiLCJjbGkiLCJkZWZhdWx0VGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsImZzIiwicmVhZEZpbGVTeW5jIiwibWlncmF0aW9uUGF0aCIsInBhdGgiLCJyZXNvbHZlIiwiY29ubmVjdGlvbiIsIm1vbmdvb3NlIiwiY3JlYXRlQ29ubmVjdGlvbiIsImVzNiIsImNvbGxlY3Rpb24iLCJsb2dTdHJpbmciLCJmb3JjZSIsImNvbnNvbGUiLCJsb2ciLCJjbG9zZSIsIm1pZ3JhdGlvbk5hbWUiLCJmaW5kT25lIiwibmFtZSIsImV4aXN0aW5nTWlncmF0aW9uIiwiRXJyb3IiLCJyZWQiLCJzeW5jIiwibm93IiwiRGF0ZSIsIm5ld01pZ3JhdGlvbkZpbGUiLCJta2RpcnAiLCJ3cml0ZUZpbGVTeW5jIiwiam9pbiIsImNyZWF0ZSIsImNyZWF0ZWRBdCIsIm1pZ3JhdGlvbkNyZWF0ZWQiLCJzdGFjayIsImZpbGVSZXF1aXJlZCIsImRpcmVjdGlvbiIsInNvcnQiLCJ1bnRpbE1pZ3JhdGlvbiIsIlJlZmVyZW5jZUVycm9yIiwicXVlcnkiLCIkbHRlIiwic3RhdGUiLCIkZ3RlIiwic29ydERpcmVjdGlvbiIsImZpbmQiLCJtaWdyYXRpb25zVG9SdW4iLCJsZW5ndGgiLCJ5ZWxsb3ciLCJsaXN0Iiwic2VsZiIsIm51bU1pZ3JhdGlvbnNSYW4iLCJtaWdyYXRpb25zUmFuIiwibWlncmF0aW9uIiwibWlncmF0aW9uRmlsZVBhdGgiLCJmaWxlbmFtZSIsIm1vZHVsZXNQYXRoIiwiX19kaXJuYW1lIiwiY29kZSIsInJlcXVpcmUiLCJwcmVzZXRzIiwicGx1Z2lucyIsIm1pZ3JhdGlvbkZ1bmN0aW9ucyIsIm1lc3NhZ2UiLCJ0ZXN0IiwiY2FsbFByb21pc2UiLCJiaW5kIiwibW9kZWwiLCJ0b1VwcGVyQ2FzZSIsIndoZXJlIiwidXBkYXRlIiwiJHNldCIsInB1c2giLCJ0b0pTT04iLCJncmVlbiIsImZpbGVzSW5NaWdyYXRpb25Gb2xkZXIiLCJyZWFkZGlyU3luYyIsIm1pZ3JhdGlvbnNJbkRhdGFiYXNlIiwibWlncmF0aW9uc0luRm9sZGVyIiwiXyIsImZpbHRlciIsImZpbGUiLCJtYXAiLCJmaWxlQ3JlYXRlZEF0IiwicGFyc2VJbnQiLCJzcGxpdCIsImV4aXN0c0luRGF0YWJhc2UiLCJzb21lIiwibSIsImZpbGVzTm90SW5EYiIsImYiLCJtaWdyYXRpb25zVG9JbXBvcnQiLCJhc2siLCJwcm9tcHQiLCJ0eXBlIiwiY2hvaWNlcyIsImFuc3dlcnMiLCJmaWxlUGF0aCIsIm1pZ3JhdGlvblRvSW1wb3J0IiwidGltZXN0YW1wU2VwYXJhdG9ySW5kZXgiLCJpbmRleE9mIiwidGltZXN0YW1wIiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsInRoZW4iLCJjcmVhdGVkTWlncmF0aW9uIiwibGVhbiIsImRiTWlncmF0aW9uc05vdE9uRnMiLCJtaWdyYXRpb25zVG9EZWxldGUiLCIkaW4iLCJtaWdyYXRpb25zVG9EZWxldGVEb2NzIiwiY3lhbiIsInJlbW92ZSIsIm1pZ3JhdGlvbnMiLCJlcnJvciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7O0FBQ0EsSUFBSUEsdUJBQUo7O0FBRUFDLG1CQUFRQyxNQUFSLENBQWU7QUFDYkMsWUFBVTtBQURHLENBQWY7O0FBSUEsSUFBTUMsOFNBQU47O0FBZ0JBLElBQU1DLDBTQUFOOztJQWlCcUJDLFE7QUFDbkIsMEJB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Q0FBVDtBQUNBLHlCQUFPaUMsRUFBRWYsTUFBRixFQUFQO0FBQ0QsaUJBSE0sQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBblRVaEYsUTs7O0FBMFRyQixTQUFTMEMsWUFBVCxDQUFzQitFLEtBQXRCLEVBQTZCO0FBQzNCLE1BQUlBLFNBQVNBLE1BQU14RCxJQUFOLElBQWMsUUFBM0IsRUFBcUM7QUFDbkMsVUFBTSxJQUFJbkIsY0FBSix5Q0FBd0QyRSxNQUFNNUcsSUFBOUQsUUFBTjtBQUNEO0FBQ0Y7O0FBRUQ2RyxPQUFPQyxPQUFQLEdBQWlCM0gsUUFBakIiLCJmaWxlIjoibGliLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0ICdjb2xvcnMnO1xuaW1wb3J0IG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgYXNrIGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IE1pZ3JhdGlvbk1vZGVsRmFjdG9yeSBmcm9tICcuL2RiJztcbmxldCBNaWdyYXRpb25Nb2RlbDtcblxuUHJvbWlzZS5jb25maWcoe1xuICB3YXJuaW5nczogZmFsc2Vcbn0pO1xuXG5jb25zdCBlczZUZW1wbGF0ZSA9IGBcbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB5b3UgbmVlZCB0byBtYWtlIHRvIHRoZSBkYXRhYmFzZSBoZXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cCAoKSB7XG4gIC8vIFdyaXRlIG1pZ3JhdGlvbiBoZXJlXG59XG5cbi8qKlxuICogTWFrZSBhbnkgY2hhbmdlcyB0aGF0IFVORE8gdGhlIHVwIGZ1bmN0aW9uIHNpZGUgZWZmZWN0cyBoZXJlIChpZiBwb3NzaWJsZSlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd24gKCkge1xuICAvLyBXcml0ZSBtaWdyYXRpb24gaGVyZVxufVxuYDtcblxuY29uc3QgZXM1VGVtcGxhdGUgPSBgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1ha2UgYW55IGNoYW5nZXMgeW91IG5lZWQgdG8gbWFrZSB0byB0aGUgZGF0YWJhc2UgaGVyZVxuICovXG5leHBvcnRzLnVwID0gZnVuY3Rpb24gdXAgKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcblxuLyoqXG4gKiBNYWtlIGFueSBjaGFuZ2VzIHRoYXQgVU5ETyB0aGUgdXAgZnVuY3Rpb24gc2lkZSBlZmZlY3RzIGhlcmUgKGlmIHBvc3NpYmxlKVxuICovXG5leHBvcnRzLmRvd24gPSBmdW5jdGlvbiBkb3duKGRvbmUpIHtcbiAgZG9uZSgpO1xufTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZ3JhdG9yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHRlbXBsYXRlUGF0aCxcbiAgICBtaWdyYXRpb25zUGF0aCA9ICcuL21pZ3JhdGlvbnMnLFxuICAgIGRiQ29ubmVjdGlvblVyaSxcbiAgICBlczZUZW1wbGF0ZXMgPSBmYWxzZSxcbiAgICBjb2xsZWN0aW9uTmFtZSA9ICdtaWdyYXRpb25zJyxcbiAgICBhdXRvc3luYyA9IGZhbHNlLFxuICAgIGNsaSA9IGZhbHNlXG4gIH0pIHtcbiAgICBjb25zdCBkZWZhdWx0VGVtcGxhdGUgPSBlczZUZW1wbGF0ZXMgPyBlczZUZW1wbGF0ZSA6IGVzNVRlbXBsYXRlO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZVBhdGggPyBmcy5yZWFkRmlsZVN5bmModGVtcGxhdGVQYXRoLCAndXRmLTgnKSA6IGRlZmF1bHRUZW1wbGF0ZTtcbiAgICB0aGlzLm1pZ3JhdGlvblBhdGggPSBwYXRoLnJlc29sdmUobWlncmF0aW9uc1BhdGgpO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG1vbmdvb3NlLmNyZWF0ZUNvbm5lY3Rpb24oZGJDb25uZWN0aW9uVXJpKTtcbiAgICB0aGlzLmVzNiA9IGVzNlRlbXBsYXRlcztcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uTmFtZTtcbiAgICB0aGlzLmF1dG9zeW5jID0gYXV0b3N5bmM7XG4gICAgdGhpcy5jbGkgPSBjbGk7XG4gICAgTWlncmF0aW9uTW9kZWwgPSBNaWdyYXRpb25Nb2RlbEZhY3RvcnkoY29sbGVjdGlvbk5hbWUsIHRoaXMuY29ubmVjdGlvbik7XG4gIH1cblxuICBsb2cobG9nU3RyaW5nLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgaWYgKGZvcmNlIHx8IHRoaXMuY2xpKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2dTdHJpbmcpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gPyB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKSA6IG51bGw7XG4gIH1cblxuICBhc3luYyBjcmVhdGUobWlncmF0aW9uTmFtZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBleGlzdGluZ01pZ3JhdGlvbiA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmZpbmRPbmUoeyBuYW1lOiBtaWdyYXRpb25OYW1lIH0pO1xuICAgICAgaWYgKCEhZXhpc3RpbmdNaWdyYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGVyZSBpcyBhbHJlYWR5IGEgbWlncmF0aW9uIHdpdGggbmFtZSAnJHttaWdyYXRpb25OYW1lfScgaW4gdGhlIGRhdGFiYXNlYC5yZWQpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBuZXdNaWdyYXRpb25GaWxlID0gYCR7bm93fS0ke21pZ3JhdGlvbk5hbWV9LmpzYDtcbiAgICAgIG1rZGlycC5zeW5jKHRoaXMubWlncmF0aW9uUGF0aCk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG5ld01pZ3JhdGlvbkZpbGUpLCB0aGlzLnRlbXBsYXRlKTtcbiAgICAgIC8vIGNyZWF0ZSBpbnN0YW5jZSBpbiBkYlxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uO1xuICAgICAgY29uc3QgbWlncmF0aW9uQ3JlYXRlZCA9IGF3YWl0IE1pZ3JhdGlvbk1vZGVsLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgIGNyZWF0ZWRBdDogbm93XG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9nKGBDcmVhdGVkIG1pZ3JhdGlvbiAke21pZ3JhdGlvbk5hbWV9IGluICR7dGhpcy5taWdyYXRpb25QYXRofS5gKTtcbiAgICAgIHJldHVybiBtaWdyYXRpb25DcmVhdGVkO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLmxvZyhlcnJvci5zdGFjayk7XG4gICAgICBmaWxlUmVxdWlyZWQoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIG1pZ3JhdGlvbnMgdXAgdG8gb3IgZG93biB0byBhIGdpdmVuIG1pZ3JhdGlvbiBuYW1lXG4gICAqXG4gICAqIEBwYXJhbSBtaWdyYXRpb25OYW1lXG4gICAqIEBwYXJhbSBkaXJlY3Rpb25cbiAgICovXG4gIGFzeW5jIHJ1bihkaXJlY3Rpb24gPSAndXAnLCBtaWdyYXRpb25OYW1lKSB7XG4gICAgYXdhaXQgdGhpcy5zeW5jKCk7XG5cbiAgICBjb25zdCB1bnRpbE1pZ3JhdGlvbiA9IG1pZ3JhdGlvbk5hbWVcbiAgICAgID8gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSh7IG5hbWU6IG1pZ3JhdGlvbk5hbWUgfSlcbiAgICAgIDogYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZE9uZSgpLnNvcnQoeyBjcmVhdGVkQXQ6IC0xIH0pO1xuXG4gICAgaWYgKCF1bnRpbE1pZ3JhdGlvbikge1xuICAgICAgaWYgKG1pZ3JhdGlvbk5hbWUpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignQ291bGQgbm90IGZpbmQgdGhhdCBtaWdyYXRpb24gaW4gdGhlIGRhdGFiYXNlJyk7XG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvcignVGhlcmUgYXJlIG5vIHBlbmRpbmcgbWlncmF0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBsZXQgcXVlcnkgPSB7XG4gICAgICBjcmVhdGVkQXQ6IHsgJGx0ZTogdW50aWxNaWdyYXRpb24uY3JlYXRlZEF0IH0sXG4gICAgICBzdGF0ZTogJ2Rvd24nXG4gICAgfTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT0gJ2Rvd24nKSB7XG4gICAgICBxdWVyeSA9IHtcbiAgICAgICAgY3JlYXRlZEF0OiB7ICRndGU6IHVudGlsTWlncmF0aW9uLmNyZWF0ZWRBdCB9LFxuICAgICAgICBzdGF0ZTogJ3VwJ1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBzb3J0RGlyZWN0aW9uID0gZGlyZWN0aW9uID09ICd1cCcgPyAxIDogLTE7XG4gICAgY29uc3QgbWlncmF0aW9uc1RvUnVuID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZChxdWVyeSkuc29ydCh7IGNyZWF0ZWRBdDogc29ydERpcmVjdGlvbiB9KTtcblxuICAgIGlmICghbWlncmF0aW9uc1RvUnVuLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuY2xpKSB7XG4gICAgICAgIHRoaXMubG9nKCdUaGVyZSBhcmUgbm8gbWlncmF0aW9ucyB0byBydW4nLnllbGxvdyk7XG4gICAgICAgIHRoaXMubG9nKGBDdXJyZW50IE1pZ3JhdGlvbnMnIFN0YXR1c2VzOiBgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5saXN0KCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIHJ1bicpO1xuICAgIH1cblxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgbnVtTWlncmF0aW9uc1JhbiA9IDA7XG4gICAgbGV0IG1pZ3JhdGlvbnNSYW4gPSBbXTtcblxuICAgIGZvciAoY29uc3QgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnNUb1J1bikge1xuICAgICAgY29uc3QgbWlncmF0aW9uRmlsZVBhdGggPSBwYXRoLmpvaW4oc2VsZi5taWdyYXRpb25QYXRoLCBtaWdyYXRpb24uZmlsZW5hbWUpO1xuICAgICAgY29uc3QgbW9kdWxlc1BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vJywgJ25vZGVfbW9kdWxlcycpO1xuICAgICAgbGV0IGNvZGUgPSBmcy5yZWFkRmlsZVN5bmMobWlncmF0aW9uRmlsZVBhdGgpO1xuICAgICAgaWYgKHRoaXMuZXM2KSB7XG4gICAgICAgIHJlcXVpcmUoJ2JhYmVsLXJlZ2lzdGVyJykoe1xuICAgICAgICAgIHByZXNldHM6IFtyZXF1aXJlKCdiYWJlbC1wcmVzZXQtbGF0ZXN0JyldLFxuICAgICAgICAgIHBsdWdpbnM6IFtyZXF1aXJlKCdiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLXJ1bnRpbWUnKV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxdWlyZSgnYmFiZWwtcG9seWZpbGwnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IG1pZ3JhdGlvbkZ1bmN0aW9ucztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbWlncmF0aW9uRnVuY3Rpb25zID0gcmVxdWlyZShtaWdyYXRpb25GaWxlUGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyLm1lc3NhZ2UgPVxuICAgICAgICAgIGVyci5tZXNzYWdlICYmIC9VbmV4cGVjdGVkIHRva2VuLy50ZXN0KGVyci5tZXNzYWdlKVxuICAgICAgICAgICAgPyAnVW5leHBlY3RlZCBUb2tlbiB3aGVuIHBhcnNpbmcgbWlncmF0aW9uLiBJZiB5b3UgYXJlIHVzaW5nIGFuIEVTNiBtaWdyYXRpb24gZmlsZSwgdXNlIG9wdGlvbiAtLWVzNidcbiAgICAgICAgICAgIDogZXJyLm1lc3NhZ2U7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFtaWdyYXRpb25GdW5jdGlvbnNbZGlyZWN0aW9uXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSAke2RpcmVjdGlvbn0gZXhwb3J0IGlzIG5vdCBkZWZpbmVkIGluICR7bWlncmF0aW9uLmZpbGVuYW1lfS5gLnJlZCk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGF3YWl0IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vICAgY29uc3QgY2FsbFByb21pc2UgPSAgbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl0uY2FsbChcbiAgICAgICAgLy8gICAgIHRoaXMuY29ubmVjdGlvbi5tb2RlbC5iaW5kKHRoaXMuY29ubmVjdGlvbiksXG4gICAgICAgIC8vICAgICBmdW5jdGlvbiBjYWxsYmFjayhlcnIpIHtcbiAgICAgICAgLy8gICAgICAgaWYgKGVycikgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAvLyAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBpZiAoY2FsbFByb21pc2UgJiYgdHlwZW9mIGNhbGxQcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gICAgIGNhbGxQcm9taXNlLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIGNvbnN0IGNhbGxQcm9taXNlID0gIG1pZ3JhdGlvbkZ1bmN0aW9uc1tkaXJlY3Rpb25dLmNhbGwoXG4gICAgICAgIC8vICAgdGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSxcbiAgICAgICAgLy8gICBlcnIgPT4ge1xuICAgICAgICAvLyAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAvLyAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgKGNhbGxQcm9taXNlICYmIHR5cGVvZiBjYWxsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICAgYXdhaXQgY2FsbFByb21pc2VcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGNvbnN0IGNhbGxQcm9taXNlID0gbWlncmF0aW9uRnVuY3Rpb25zW2RpcmVjdGlvbl07XG4gICAgICAgIGNhbGxQcm9taXNlLmJpbmQodGhpcy5jb25uZWN0aW9uLm1vZGVsLmJpbmQodGhpcy5jb25uZWN0aW9uKSk7XG4gICAgICAgIGF3YWl0IGNhbGxQcm9taXNlKCk7XG5cbiAgICAgICAgdGhpcy5sb2coYCR7ZGlyZWN0aW9uLnRvVXBwZXJDYXNlKCl9OiAgIGBbZGlyZWN0aW9uID09ICd1cCcgPyAnZ3JlZW4nIDogJ3JlZCddICsgYCAke21pZ3JhdGlvbi5maWxlbmFtZX0gYCk7XG5cbiAgICAgICAgYXdhaXQgTWlncmF0aW9uTW9kZWwud2hlcmUoeyBuYW1lOiBtaWdyYXRpb24ubmFtZSB9KS51cGRhdGUoeyAkc2V0OiB7IHN0YXRlOiBkaXJlY3Rpb24gfSB9KTtcbiAgICAgICAgbWlncmF0aW9uc1Jhbi5wdXNoKG1pZ3JhdGlvbi50b0pTT04oKSk7XG4gICAgICAgIG51bU1pZ3JhdGlvbnNSYW4rKztcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmxvZyhgRmFpbGVkIHRvIHJ1biBtaWdyYXRpb24gJHttaWdyYXRpb24ubmFtZX0gZHVlIHRvIGFuIGVycm9yLmAucmVkKTtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBjb250aW51aW5nLiBNYWtlIHN1cmUgeW91ciBkYXRhIGlzIGluIGNvbnNpc3RlbnQgc3RhdGVgLnJlZCk7XG4gICAgICAgIHRocm93IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyIDogbmV3IEVycm9yKGVycik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pZ3JhdGlvbnNUb1J1bi5sZW5ndGggPT0gbnVtTWlncmF0aW9uc1JhbikgdGhpcy5sb2coJ0FsbCBtaWdyYXRpb25zIGZpbmlzaGVkIHN1Y2Nlc3NmdWxseS4nLmdyZWVuKTtcbiAgICByZXR1cm4gbWlncmF0aW9uc1JhbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rcyBhdCB0aGUgZmlsZSBzeXN0ZW0gbWlncmF0aW9ucyBhbmQgaW1wb3J0cyBhbnkgbWlncmF0aW9ucyB0aGF0IGFyZVxuICAgKiBvbiB0aGUgZmlsZSBzeXN0ZW0gYnV0IG1pc3NpbmcgaW4gdGhlIGRhdGFiYXNlIGludG8gdGhlIGRhdGFiYXNlXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvcHBvc2l0ZSBvZiBwcnVuZSgpXG4gICAqL1xuICBhc3luYyBzeW5jKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSk7XG4gICAgICAvLyBHbyBvdmVyIG1pZ3JhdGlvbnMgaW4gZm9sZGVyIGFuZCBkZWxldGUgYW55IGZpbGVzIG5vdCBpbiBEQlxuICAgICAgY29uc3QgbWlncmF0aW9uc0luRm9sZGVyID0gXy5maWx0ZXIoZmlsZXNJbk1pZ3JhdGlvbkZvbGRlciwgZmlsZSA9PiAvXFxkezEzLH1cXC0uKy5qcyQvLnRlc3QoZmlsZSkpLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9IG1pZ3JhdGlvbnNJbkRhdGFiYXNlLnNvbWUobSA9PiBmaWxlbmFtZSA9PSBtLmZpbGVuYW1lKTtcbiAgICAgICAgcmV0dXJuIHsgY3JlYXRlZEF0OiBmaWxlQ3JlYXRlZEF0LCBmaWxlbmFtZSwgZXhpc3RzSW5EYXRhYmFzZSB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZpbGVzTm90SW5EYiA9IF8uZmlsdGVyKG1pZ3JhdGlvbnNJbkZvbGRlciwgeyBleGlzdHNJbkRhdGFiYXNlOiBmYWxzZSB9KS5tYXAoZiA9PiBmLmZpbGVuYW1lKTtcbiAgICAgIGxldCBtaWdyYXRpb25zVG9JbXBvcnQgPSBmaWxlc05vdEluRGI7XG4gICAgICB0aGlzLmxvZygnU3luY2hyb25pemluZyBkYXRhYmFzZSB3aXRoIGZpbGUgc3lzdGVtIG1pZ3JhdGlvbnMuLi4nKTtcbiAgICAgIGlmICghdGhpcy5hdXRvc3luYyAmJiBtaWdyYXRpb25zVG9JbXBvcnQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgYXNrLnByb21wdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAnVGhlIGZvbGxvd2luZyBtaWdyYXRpb25zIGV4aXN0IGluIHRoZSBtaWdyYXRpb25zIGZvbGRlciBidXQgbm90IGluIHRoZSBkYXRhYmFzZS4gU2VsZWN0IHRoZSBvbmVzIHlvdSB3YW50IHRvIGltcG9ydCBpbnRvIHRoZSBkYXRhYmFzZScsXG4gICAgICAgICAgICAgIG5hbWU6ICdtaWdyYXRpb25zVG9JbXBvcnQnLFxuICAgICAgICAgICAgICBjaG9pY2VzOiBmaWxlc05vdEluRGJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbnN3ZXJzID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBtaWdyYXRpb25zVG9JbXBvcnQgPSBhbnN3ZXJzLm1pZ3JhdGlvbnNUb0ltcG9ydDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UubWFwKG1pZ3JhdGlvbnNUb0ltcG9ydCwgbWlncmF0aW9uVG9JbXBvcnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbih0aGlzLm1pZ3JhdGlvblBhdGgsIG1pZ3JhdGlvblRvSW1wb3J0KSxcbiAgICAgICAgICB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCA9IG1pZ3JhdGlvblRvSW1wb3J0LmluZGV4T2YoJy0nKSxcbiAgICAgICAgICB0aW1lc3RhbXAgPSBtaWdyYXRpb25Ub0ltcG9ydC5zbGljZSgwLCB0aW1lc3RhbXBTZXBhcmF0b3JJbmRleCksXG4gICAgICAgICAgbWlncmF0aW9uTmFtZSA9IG1pZ3JhdGlvblRvSW1wb3J0LnNsaWNlKHRpbWVzdGFtcFNlcGFyYXRvckluZGV4ICsgMSwgbWlncmF0aW9uVG9JbXBvcnQubGFzdEluZGV4T2YoJy4nKSk7XG5cbiAgICAgICAgdGhpcy5sb2coYEFkZGluZyBtaWdyYXRpb24gJHtmaWxlUGF0aH0gaW50byBkYXRhYmFzZSBmcm9tIGZpbGUgc3lzdGVtLiBTdGF0ZSBpcyBgICsgYERPV05gLnJlZCk7XG4gICAgICAgIHJldHVybiBNaWdyYXRpb25Nb2RlbC5jcmVhdGUoe1xuICAgICAgICAgIG5hbWU6IG1pZ3JhdGlvbk5hbWUsXG4gICAgICAgICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcbiAgICAgICAgfSkudGhlbihjcmVhdGVkTWlncmF0aW9uID0+IGNyZWF0ZWRNaWdyYXRpb24udG9KU09OKCkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nKGBDb3VsZCBub3Qgc3luY2hyb25pc2UgbWlncmF0aW9ucyBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIgdXAgdG8gdGhlIGRhdGFiYXNlLmAucmVkKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcHBvc2l0ZSBvZiBzeW5jKCkuXG4gICAqIFJlbW92ZXMgZmlsZXMgaW4gbWlncmF0aW9uIGRpcmVjdG9yeSB3aGljaCBkb24ndCBleGlzdCBpbiBkYXRhYmFzZS5cbiAgICovXG4gIGFzeW5jIHBydW5lKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlc0luTWlncmF0aW9uRm9sZGVyID0gZnMucmVhZGRpclN5bmModGhpcy5taWdyYXRpb25QYXRoKTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkRhdGFiYXNlID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7fSkubGVhbigpO1xuICAgICAgLy8gR28gb3ZlciBtaWdyYXRpb25zIGluIGZvbGRlciBhbmQgZGVsZXRlIGFueSBmaWxlcyBub3QgaW4gREJcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNJbkZvbGRlciA9IF8uZmlsdGVyKGZpbGVzSW5NaWdyYXRpb25Gb2xkZXIsIGZpbGUgPT4gL1xcZHsxMyx9XFwtLisuanMvLnRlc3QoZmlsZSkpLm1hcChmaWxlbmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVDcmVhdGVkQXQgPSBwYXJzZUludChmaWxlbmFtZS5zcGxpdCgnLScpWzBdKTtcbiAgICAgICAgY29uc3QgZXhpc3RzSW5EYXRhYmFzZSA9ICEhXy5maW5kKG1pZ3JhdGlvbnNJbkRhdGFiYXNlLCB7IGNyZWF0ZWRBdDogbmV3IERhdGUoZmlsZUNyZWF0ZWRBdCkgfSk7XG4gICAgICAgIHJldHVybiB7IGNyZWF0ZWRBdDogZmlsZUNyZWF0ZWRBdCwgZmlsZW5hbWUsIGV4aXN0c0luRGF0YWJhc2UgfTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYk1pZ3JhdGlvbnNOb3RPbkZzID0gXy5maWx0ZXIobWlncmF0aW9uc0luRGF0YWJhc2UsIG0gPT4ge1xuICAgICAgICByZXR1cm4gIV8uZmluZChtaWdyYXRpb25zSW5Gb2xkZXIsIHsgZmlsZW5hbWU6IG0uZmlsZW5hbWUgfSk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGRiTWlncmF0aW9uc05vdE9uRnMubWFwKG0gPT4gbS5uYW1lKTtcblxuICAgICAgaWYgKCF0aGlzLmF1dG9zeW5jICYmICEhbWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIGFzay5wcm9tcHQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgJ1RoZSBmb2xsb3dpbmcgbWlncmF0aW9ucyBleGlzdCBpbiB0aGUgZGF0YWJhc2UgYnV0IG5vdCBpbiB0aGUgbWlncmF0aW9ucyBmb2xkZXIuIFNlbGVjdCB0aGUgb25lcyB5b3Ugd2FudCB0byByZW1vdmUgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uJyxcbiAgICAgICAgICAgICAgbmFtZTogJ21pZ3JhdGlvbnNUb0RlbGV0ZScsXG4gICAgICAgICAgICAgIGNob2ljZXM6IG1pZ3JhdGlvbnNUb0RlbGV0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuc3dlcnMgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKGFuc3dlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1pZ3JhdGlvbnNUb0RlbGV0ZSA9IGFuc3dlcnMubWlncmF0aW9uc1RvRGVsZXRlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaWdyYXRpb25zVG9EZWxldGVEb2NzID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCh7XG4gICAgICAgIG5hbWU6IHsgJGluOiBtaWdyYXRpb25zVG9EZWxldGUgfVxuICAgICAgfSkubGVhbigpO1xuXG4gICAgICBpZiAobWlncmF0aW9uc1RvRGVsZXRlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmxvZyhgUmVtb3ZpbmcgbWlncmF0aW9uKHMpIGAsIGAke21pZ3JhdGlvbnNUb0RlbGV0ZS5qb2luKCcsICcpfWAuY3lhbiwgYCBmcm9tIGRhdGFiYXNlYCk7XG4gICAgICAgIGF3YWl0IE1pZ3JhdGlvbk1vZGVsLnJlbW92ZSh7XG4gICAgICAgICAgbmFtZTogeyAkaW46IG1pZ3JhdGlvbnNUb0RlbGV0ZSB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWlncmF0aW9uc1RvRGVsZXRlRG9jcztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2coYENvdWxkIG5vdCBwcnVuZSBleHRyYW5lb3VzIG1pZ3JhdGlvbnMgZnJvbSBkYXRhYmFzZS5gLnJlZCk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIGN1cnJlbnQgbWlncmF0aW9ucyBhbmQgdGhlaXIgc3RhdHVzZXNcbiAgICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8T2JqZWN0Pj59XG4gICAqIEBleGFtcGxlXG4gICAqICAgW1xuICAgKiAgICB7IG5hbWU6ICdteS1taWdyYXRpb24nLCBmaWxlbmFtZTogJzE0OTIxMzIyMzQyNF9teS1taWdyYXRpb24uanMnLCBzdGF0ZTogJ3VwJyB9LFxuICAgKiAgICB7IG5hbWU6ICdhZGQtY293cycsIGZpbGVuYW1lOiAnMTQ5MjEzMjIzNDUzX2FkZC1jb3dzLmpzJywgc3RhdGU6ICdkb3duJyB9XG4gICAqICAgXVxuICAgKi9cbiAgYXN5bmMgbGlzdCgpIHtcbiAgICBhd2FpdCB0aGlzLnN5bmMoKTtcbiAgICBjb25zdCBtaWdyYXRpb25zID0gYXdhaXQgTWlncmF0aW9uTW9kZWwuZmluZCgpLnNvcnQoeyBjcmVhdGVkQXQ6IDEgfSk7XG4gICAgaWYgKCFtaWdyYXRpb25zLmxlbmd0aCkgdGhpcy5sb2coJ1RoZXJlIGFyZSBubyBtaWdyYXRpb25zIHRvIGxpc3QuJy55ZWxsb3cpO1xuICAgIHJldHVybiBtaWdyYXRpb25zLm1hcChtID0+IHtcbiAgICAgIHRoaXMubG9nKGAke20uc3RhdGUgPT0gJ3VwJyA/ICdVUDogIFxcdCcgOiAnRE9XTjpcXHQnfWBbbS5zdGF0ZSA9PSAndXAnID8gJ2dyZWVuJyA6ICdyZWQnXSArIGAgJHttLmZpbGVuYW1lfWApO1xuICAgICAgcmV0dXJuIG0udG9KU09OKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmlsZVJlcXVpcmVkKGVycm9yKSB7XG4gIGlmIChlcnJvciAmJiBlcnJvci5jb2RlID09ICdFTk9FTlQnKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBDb3VsZCBub3QgZmluZCBhbnkgZmlsZXMgYXQgcGF0aCAnJHtlcnJvci5wYXRofSdgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1pZ3JhdG9yO1xuIl19