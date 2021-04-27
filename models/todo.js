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
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
        validate: {
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
    ToDo.belongsTo(models.User);
    /** 1 : N   Journey : ToDo */
    ToDo.belongsTo(models.Journey);
  };

  return ToDo;
};
