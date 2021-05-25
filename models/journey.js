const VALUES = {
  HAPPINESS: '행복',
  CONTROL: '절제',
  GRATITUDE: '감사',
  REST: '휴식',
  GROWTH: '성장',
  CHANGE: '변화',
  HEALTH: '건강',
  OVERCOME: '극복',
  CHALLENGE: '도전',
};
Object.freeze(VALUES);

module.exports = (sequelize, DataTypes) => {
  const Journey = sequelize.define(
    'journey',
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
      value1: {
        allowNull: false,
        type: DataTypes.ENUM(Object.values(VALUES)),
        validate: {
          isIn: [Object.values(VALUES)],
          notNull: true,
        },
      },
      value2: {
        allowNull: true,
        type: DataTypes.ENUM(Object.values(VALUES)),
        validate: {
          isIn: [Object.values(VALUES)],
        },
      },
      year: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        validate: {
          notNull: true,
        },
      },
      month: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        validate: {
          notNull: true,
          max: 12,
          min: 1,
        },
      },
      weekNo: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        validate: {
          notNull: true,
        },
      },
      date: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        validate: {
          isDate: true,
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
    },
    {
      timestamps: true,
    },
  );

  Journey.associate = (models) => {
    /** 1 : N   User : Journey */
    Journey.belongsTo(models.User, {
      foreignKey: {
        name: 'userIdx',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    /** 1 : N   Journey : ToDo */
    Journey.hasMany(models.ToDo, {
      foreignKey: 'journeyIdx',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      sourceKey: 'idx',
    });
  };

  Journey.VALUES = VALUES;

  return Journey;
};
