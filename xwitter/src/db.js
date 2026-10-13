import { Sequelize, DataTypes, Op } from 'sequelize';
import path from 'node:path';
import fs from 'node:fs';
const file = process.env.DB_PATH || './data/xwitter.sqlite';
fs.mkdirSync(path.dirname(path.resolve(file)), {recursive:true});
export const sequelize = new Sequelize({dialect:'sqlite',storage:file,logging:false});
export {Op};
export const User = sequelize.define('User', {
  name:{type:DataTypes.STRING(80),allowNull:false},
  handle:{type:DataTypes.STRING(32),allowNull:false,unique:true,validate:{is:/^[a-z0-9_]{3,32}$/}},
  email:{type:DataTypes.STRING(250),allowNull:false,unique:true},
  passwordHash:{type:DataTypes.STRING(255),allowNull:false},
  bio:{type:DataTypes.STRING(240),defaultValue:''},
  avatar:{type:DataTypes.STRING(40),defaultValue:'aurora'}
});
export const Post = sequelize.define('Post', {
  body:{type:DataTypes.TEXT,allowNull:false},
  parentId:{type:DataTypes.INTEGER,allowNull:true}
});
export const Like = sequelize.define('Like',{}, {indexes:[{unique:true,fields:['UserId','PostId']}]});
export const Follow = sequelize.define('Follow',{}, {indexes:[{unique:true,fields:['followerId','followingId']}]});
User.hasMany(Post,{foreignKey:'authorId',as:'posts',onDelete:'CASCADE'});
Post.belongsTo(User,{foreignKey:'authorId',as:'author'});
Post.belongsTo(Post,{foreignKey:'parentId',as:'parent'});
Post.hasMany(Post,{foreignKey:'parentId',as:'replies'});
User.belongsToMany(Post,{through:Like,as:'likedPosts'});
Post.belongsToMany(User,{through:Like,as:'likers'});
User.belongsToMany(User,{through:Follow,as:'following',foreignKey:'followerId',otherKey:'followingId'});
User.belongsToMany(User,{through:Follow,as:'followers',foreignKey:'followingId',otherKey:'followerId'});
export function graphemeLength(value){ return [...new Intl.Segmenter('pt-BR',{granularity:'grapheme'}).segment(value)].length; }
export function hashtags(value){return [...new Set([...value.matchAll(/#([\p{L}\p{N}_]+)/gu)].map(m=>m[1].toLocaleLowerCase('pt-BR')))];}
