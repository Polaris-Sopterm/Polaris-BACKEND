const EMOTION = {
  COMFORTABLE: '편안',
  INCONVENIENCE: '불편',
  EXPECTATION: '기대',
  FRUSTRATED: '답답',
  EASY: '무난',
  JOY: '기쁨',
  ANGRY: '화남',
  REGRETFUL: '아쉬움',
  SATISFACTION: '만족',
};
Object.freeze(EMOTION);

module.exports = (sequelize, DataTypes) => {
  const Retrospect = sequelize.define('retrospect', {
    idx: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    value: {
      allowNull: false,
      type: DataTypes.TEXT,
      /**
       * @returns {null|any}
       */
      get() {
        try {
          return JSON.parse(this.getDataValue('value'));
        } catch (e) {
          return null;
        }
      },
      /**
       * @param {object} value
       */
      set(value) {
        if (value === undefined) {
          throw Error('`value` should be exist');
        }
        this.setDataValue('value', JSON.stringify(value));
      },
    },
    record1: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.TEXT,
    },
    record2: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.TEXT,
    },
    record3: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.TEXT,
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
  }, {
    timestamps: true,
  });

  Retrospect.associate = (models) => {
    Retrospect.belongsTo(models.User, {
      foreignKey: {
        name: 'userIdx',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  Retrospect.EMOTION = EMOTION;

  return Retrospect;
};
