const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('refreshToken', {
    refreshToken: {
      allowNull: false,
      type: DataTypes.STRING(128),
      unique: true,
      validate: {
        notNull: true,
      },
    },
    expiresAt: {
      allowNull: false,
      type: DataTypes.DATE,
      validate: {
        isDate: true,
      },
    },
    isExpired: {
      type: DataTypes.VIRTUAL,
      /**
       * @returns {boolean}
       */
      get() {
        return moment(this.expiresAt) < moment();
      },
    },
  }, {
    timestamps: true,
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  return RefreshToken;
};
