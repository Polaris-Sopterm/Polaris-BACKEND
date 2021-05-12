/* eslint-disable func-names */

const bcrypt = require('bcryptjs');
const moment = require('moment');

const ACTION = {
  VALIDATE_LOGIN_EMAIL: 'ValidateLoginEmail',
  RESET_PASSWORD: 'ResetPassword',
};
Object.freeze(ACTION);

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('token', {
    id: {
      allowNull: false,
      autoIncrement: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
      validate: {
        isUUID: 4,
        notNull: true,
      },
    },
    secret: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: true,
      },
      /**
       * @param {string} value
       */
      set(value) {
        if (!value) return;
        const salt = bcrypt.genSaltSync();
        this.setDataValue('secret', bcrypt.hashSync(value, salt));
      },
    },
    action: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notNull: true,
      },
      /**
       * @returns {null|any}
       */
      get() {
        try {
          return JSON.parse(this.getDataValue('action'));
        } catch (e) {
          return null;
        }
      },
      /**
       * @param {object} value
       */
      set(value) {
        if (!(value instanceof Object)) {
          throw Error('`action` value should be an instance of Object.');
        }
        this.setDataValue('action', JSON.stringify(value));
      },
    },
    isExpired: {
      type: DataTypes.VIRTUAL,
      /**
       * @returns {boolean}
       */
      get() {
        return moment(this.createdAt) < moment().subtract(30, 'minutes');
      },
    },
  }, {
    timestamps: true,
  });

  Token.associate = (models) => {
    Token.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: true,
      },
      onDelete: 'CASCADE',
    });
  };

  Token.ACTION = ACTION;

  /**
   * @param {string} secret
   * @returns {boolean}
   */
  Token.prototype.validateSecret = function (secret) {
    try {
      return bcrypt.compareSync(secret, this.secret);
    } catch (e) {
      return false;
    }
  };

  return Token;
};
