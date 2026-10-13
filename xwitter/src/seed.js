import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {sequelize,User,Post,Like,Follow} from './db.js';
await sequelize.sync();
const names=['Ana','Bruno','Carla','Diego','Elisa'];
const users={};
for(const [i,name] of names.entries()){const handle=name.toLowerCase();const [u]=await User.findOrCreate({where:{handle},defaults:{name,handle,email:`${handle}@exemplo.test`,passwordHash:await bcrypt.hash(`Senha-Exemplo-${name}-2026!`,12),avatar:['aurora','lago','sol','orbita'][i%4]}});users[name]=u;}
const bodies=['Explorando novas ideias sobre #web','Um olhar para o #design','Construir em comunidade com #web','A expressão transforma a #arte','A #web e a #arte se encontram'];
const authors=['Ana','Ana','Bruno','Carla','Diego'];
const posts=[];
for(let i=0;i<5;i++){const date=new Date();date.setUTCDate(date.getUTCDate()-(5-i));const [p]=await Post.findOrCreate({where:{body:bodies[i],authorId:users[authors[i]].id,parentId:null},defaults:{createdAt:date}});posts.push(p)}
for(const [person,body] of [['Bruno','Muito interessante!'],['Carla','Concordo com você.']]) await Post.findOrCreate({where:{body,authorId:users[person].id,parentId:posts[0].id}});
for(const [postIndex,people] of [[0,['Bruno','Carla','Diego']],[1,['Bruno']],[2,['Ana','Elisa']],[3,['Ana']]])for(const name of people)await Like.findOrCreate({where:{UserId:users[name].id,PostId:posts[postIndex].id}});
for(const [a,b] of [['Ana','Bruno'],['Ana','Carla'],['Bruno','Ana'],['Carla','Ana']])await Follow.findOrCreate({where:{followerId:users[a].id,followingId:users[b].id}});
console.log('Seed concluído: cinco usuários fictícios, cinco publicações principais, duas respostas, sete curtidas.');await sequelize.close();
