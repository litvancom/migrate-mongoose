'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'migrations';
  var dbConnection = arguments[1];


  var MigrationSchema = new _mongoose.Schema({
    name: String,
    createdAt: Date,
    state: {
      type: String,
      enum: ['down', 'up'],
      default: 'down'
    }
  }, {
    collection: collection,
    toJSON: {
      virtuals: true,
      transform: function transform(doc, ret, options) {
        delete ret._id;
        delete ret.id;
        delete ret.__v;
        return ret;
      }
    }
  });

  MigrationSchema.virtual('filename').get(function () {
    return this.createdAt.getTime() + '-' + this.name + '.js';
  });

  dbConnection.on('error', function (err) {
    console.error('MongoDB Connection Error: ' + err);
  });

  return dbConnection.model(collection, MigrationSchema);
};

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Factory function for a mongoose model
_mongoose2.default.Promise = _bluebird2.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYi5qcyJdLCJuYW1lcyI6WyJjb2xsZWN0aW9uIiwiZGJDb25uZWN0aW9uIiwiTWlncmF0aW9uU2NoZW1hIiwiU2NoZW1hIiwibmFtZSIsIlN0cmluZyIsImNyZWF0ZWRBdCIsIkRhdGUiLCJzdGF0ZSIsInR5cGUiLCJlbnVtIiwiZGVmYXVsdCIsInRvSlNPTiIsInZpcnR1YWxzIiwidHJhbnNmb3JtIiwiZG9jIiwicmV0Iiwib3B0aW9ucyIsIl9pZCIsImlkIiwiX192IiwidmlydHVhbCIsImdldCIsImdldFRpbWUiLCJvbiIsImNvbnNvbGUiLCJlcnJvciIsImVyciIsIm1vZGVsIiwibW9uZ29vc2UiLCJQcm9taXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBS2UsWUFBcUQ7QUFBQSxNQUExQ0EsVUFBMEMsdUVBQTdCLFlBQTZCO0FBQUEsTUFBZkMsWUFBZTs7O0FBRWxFLE1BQU1DLGtCQUFrQixJQUFJQyxnQkFBSixDQUFXO0FBQ2pDQyxVQUFNQyxNQUQyQjtBQUVqQ0MsZUFBV0MsSUFGc0I7QUFHakNDLFdBQU87QUFDTEMsWUFBTUosTUFERDtBQUVMSyxZQUFNLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FGRDtBQUdMQyxlQUFTO0FBSEo7QUFIMEIsR0FBWCxFQVFyQjtBQUNEWCxnQkFBWUEsVUFEWDtBQUVEWSxZQUFRO0FBQ05DLGdCQUFVLElBREo7QUFFTkMsaUJBQVcsbUJBQVNDLEdBQVQsRUFBY0MsR0FBZCxFQUFtQkMsT0FBbkIsRUFBNEI7QUFDckMsZUFBT0QsSUFBSUUsR0FBWDtBQUNBLGVBQU9GLElBQUlHLEVBQVg7QUFDQSxlQUFPSCxJQUFJSSxHQUFYO0FBQ0EsZUFBT0osR0FBUDtBQUNEO0FBUEs7QUFGUCxHQVJxQixDQUF4Qjs7QUFxQkFkLGtCQUFnQm1CLE9BQWhCLENBQXdCLFVBQXhCLEVBQW9DQyxHQUFwQyxDQUF3QyxZQUFXO0FBQ2pELFdBQVUsS0FBS2hCLFNBQUwsQ0FBZWlCLE9BQWYsRUFBVixTQUFzQyxLQUFLbkIsSUFBM0M7QUFDRCxHQUZEOztBQUlBSCxlQUFhdUIsRUFBYixDQUFnQixPQUFoQixFQUF5QixlQUFPO0FBQzlCQyxZQUFRQyxLQUFSLGdDQUEyQ0MsR0FBM0M7QUFDRCxHQUZEOztBQUlBLFNBQU8xQixhQUFhMkIsS0FBYixDQUFvQjVCLFVBQXBCLEVBQWdDRSxlQUFoQyxDQUFQO0FBQ0QsQzs7QUFyQ0Q7Ozs7QUFDQTs7Ozs7O0FBQ0E7QUFDQTJCLG1CQUFTQyxPQUFULEdBQW1CQSxrQkFBbkIiLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UsIHsgU2NoZW1hIH0gIGZyb20gJ21vbmdvb3NlJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbi8vIEZhY3RvcnkgZnVuY3Rpb24gZm9yIGEgbW9uZ29vc2UgbW9kZWxcbm1vbmdvb3NlLlByb21pc2UgPSBQcm9taXNlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoIGNvbGxlY3Rpb24gPSAnbWlncmF0aW9ucycsIGRiQ29ubmVjdGlvbiApIHtcblxuICBjb25zdCBNaWdyYXRpb25TY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgICBuYW1lOiBTdHJpbmcsXG4gICAgY3JlYXRlZEF0OiBEYXRlLFxuICAgIHN0YXRlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBlbnVtOiBbJ2Rvd24nLCAndXAnXSxcbiAgICAgIGRlZmF1bHQ6ICdkb3duJ1xuICAgIH1cbiAgfSwge1xuICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgdG9KU09OOiB7XG4gICAgICB2aXJ0dWFsczogdHJ1ZSxcbiAgICAgIHRyYW5zZm9ybTogZnVuY3Rpb24oZG9jLCByZXQsIG9wdGlvbnMpIHtcbiAgICAgICAgZGVsZXRlIHJldC5faWQ7XG4gICAgICAgIGRlbGV0ZSByZXQuaWQ7XG4gICAgICAgIGRlbGV0ZSByZXQuX192O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgTWlncmF0aW9uU2NoZW1hLnZpcnR1YWwoJ2ZpbGVuYW1lJykuZ2V0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmNyZWF0ZWRBdC5nZXRUaW1lKCl9LSR7dGhpcy5uYW1lfS5qc2A7XG4gIH0pO1xuXG4gIGRiQ29ubmVjdGlvbi5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoYE1vbmdvREIgQ29ubmVjdGlvbiBFcnJvcjogJHtlcnJ9YCk7XG4gIH0pO1xuXG4gIHJldHVybiBkYkNvbm5lY3Rpb24ubW9kZWwoIGNvbGxlY3Rpb24sIE1pZ3JhdGlvblNjaGVtYSApO1xufVxuXG4iXX0=