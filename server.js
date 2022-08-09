const express=require('express');
const neo4j=require('neo4j-driver');

const CONNECTION_STRING="bolt://localhost:7687";
const driver=neo4j.driver(CONNECTION_STRING);

async function init(){
    const app=express();
    app.get('/get',async (req, res)=>{
        const session = driver.session();
        const result = await session.run(
            `MATCH path=shortestPath(
                (p:Person {name: $p1})-[*]-(q:Person {name :$q1})
            )
            UNWIND nodes(path) as node
            RETURN coalesce(node.name,node.title) as text;
            `
        ,{
            p1:req.query.person1,
            q1:req.query.person2,
        })

        res.json({
            status:'ok',
            path: result.records.map((r)=>r.get('text'))
        }).end();
        await session.close();

    })
    app.use(express.static('./static'));
    app.listen(3000,()=>{
        console.log('App started at port 3000')
    })
}
init();