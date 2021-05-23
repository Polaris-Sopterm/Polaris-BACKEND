const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(128),
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      nickname: {
        allowNull: false,
        type: DataTypes.STRING(20),
        validate: {
          notNull: true,
        },
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING(200),
        set(value) {
          const salt = bcrypt.genSaltSync();
          this.setDataValue('password', bcrypt.hashSync(value, salt));
        },
        validate: {
          notNull: true,
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE(3),
        validate: {
          isDate: true,
          notNull: true,
        },
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE(3),
        validate: {
          isDate: true,
          notNull: true,
        },
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE(3),
        validate: {
          isDate: true,
        },
      },
    },
    {
      paranoid: true,
      timestamps: true,
    },
  );

  User.prototype.validatePasswordHash = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.associate = (models) => {
    /** 1 : N   User : Journey */
    User.hasMany(models.Journey, {
      foreignKey: 'userIdx',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      sourceKey: 'idx',
    });
    /** 1 : N   User : Todo */
    User.hasMany(models.ToDo, {
      foreignKey: 'userIdx',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      sourceKey: 'idx',
    });
  };

  return User;
};
