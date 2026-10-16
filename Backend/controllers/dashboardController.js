const db=require("../config/dbConnection");

const dashboardSummary=(req,res)=>{
    let sql="Select * from subjects";
    db.query(sql,(err,data)=>{
        if(err){
            res.json(err.message);
            return;
        }
        let result=[];
        let lowCount=0;
        let avgPer=0;
        for(let i=0;i<data.length;i++){
            const per=data[i].classes_held==0?0:(data[i].classes_attended/data[i].classes_held)*100
            result.push({...data[i],attendance_percentage:per,attendance_status:per<75?"low":per<80?"maintain":"good"}
            );
            if(per<75){
                lowCount++;
            }
            avgPer=avgPer+per;

        }
        res.status(200).json({
            summary:{
                total_subjects:result.length,
                low_attendance_count:lowCount,
                average_attendance_percentage:avgPer/result.length,
                attendance_threshold:75,
            },
            data:result});
    })
}

module.exports={dashboardSummary};