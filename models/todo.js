module.exports = (sequelize, DataTypes) => {
  const ToDo = sequelize.define(
    'toDo',
    {
      idx: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notNull: true,
        },
      },
      date: {
        allowNull: false,
        type: DataTypes.DATE,
        validate: {
          notNull: true,
        },
      },
      isTop: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
        validate: {
          notNull: true,
        },
      },
      isDone: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.DATE(3),
        validate: {
          isDate: true,
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
    },
    {
      timestamps: true,
    },
  );

  ToDo.associate = (models) => {
    /** 1 : N   User : ToDo */
    ToDo.belongsTo(models.User, {
      foreignKey: {
        name: 'userIdx',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    /** 1 : N   Journey : ToDo */
    ToDo.belongsTo(models.Journey, {
      foreignKey: {
        name: 'journeyIdx',
        allowNull: true,
      },
      onDelete: 'CASCADE',
    });
  };

  return ToDo;
};
