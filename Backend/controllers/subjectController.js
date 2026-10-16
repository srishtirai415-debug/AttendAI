const db=require("../config/dbConnection");

const getAllSubjects=(req,res)=>{
    let sql="Select * from subjects";
    db.query(sql,(err,data)=>{
        if(err){
            res.json(err.message);
            return;
        }
        let result=[];
        for(let i=0;i<data.length;i++){
            const per=data[i].classes_held==0?0:(data[i].classes_attended/data[i].classes_held)*100
            result.push({...data[i],attendance_percentage:per,attendance_status:per<75?"low":per<80?"maintain":"good"}
            );
        }
        res.status(200).json({msg:"Successfully done",data:result});
    })
}

const getOneSubject=(req,res)=>{
    const sql=`Select * from subjects where id=${Number(req.params.id)}`;
    db.query(sql,(err,data)=>{
        if(err){
            res.status(404).json({msg:"Not found",error:err});
        }
        const per=data.classes_held==0?0:(data[0].classes_attended/data[0].classes_held)*100
        res.status(200).json({msg:"Successfully",data:{...data[0],attendance_percentage:per,attendance_status:per<75?"low":per<80?"maintain":"good"}
        });
    })
}

const createSubject=(req,res)=>{
    const sql=`INSERT INTO subjects(name, classes_held, classes_attended) values("${req.body.name}",${req.body.classes_held},${req.body.classes_attended});`;
    console.log(req.body);
    db.query(sql,(err,data)=>{
        if(err){
            res.status(404).json({msg:"Not found",error:err});
        }
        res.status(200).json({msg:"Successfully created"});
    })
}

const updateSubject=(req,res)=>{
    const sql=`update subjects set name="${req.body.name}", classes_held=${req.body.classes_held}, classes_attended=${req.body.classes_attended} where id=${req.params.id};`
    db.query(sql,(err,data)=>{
        if(err){
            res.status(404).json({msg:"Not found",error:err});
        }
        res.status(200).json({msg:"Successfully updated",subjects:data});
    })
}

const deleteSubject=(req,res)=>{
    const sql=`delete from subjects where id=${req.params.id};`
    db.query(sql,(err,data)=>{
        if(err){
            res.status(404).json({msg:"Not found",error:err}); 
        }
        res.status(200).json({msg:"Successfully deleted"});
    })
}


module.exports={getAllSubjects,getOneSubject,createSubject,updateSubject,deleteSubject};