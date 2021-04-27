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
      name: {
        allowNull: false,
        type: DataTypes.STRING(20),
        unique: true,
        validate: {
          notNull: true,
        },
      },
      salt: {
        allowNull: false,
        type: DataTypes.STRING(200),
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING(200),
        validate: {
          notNull: true,
        },
      },
    },
    {
      paranoid: true,
      timestamps: true,
    },
  );

  User.associate = (models) => {
    /** 1 : N   User : Journey */
    User.hasMany(models.Journey);
    /** 1 : N   User : Todo */
    User.hasMany(models.ToDo);
  };

  return User;
};
