[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/w8H8oomW)

**<ins>Note</ins>: Students must update this `README.md` file to be an installation manual or a README file for their own CS403 projects.**

**รหัสโครงงาน:** 67-1_03_ssr-r2

**ชื่อโครงงาน (ไทย): เว็ปไซต์ติดตามนโยบาย กิจกิกรรม และการเงิน ของพรรคการเมือง** 

**Project Title (Eng): Policy Tracking Website for monitoring the policies, activities, and finances of political parties. **


**อาจารย์ที่ปรึกษาโครงงาน:** ผศ. ดร. ทรงศักดิ์ รองวิริยะพาณิชย์

**ผู้จัดทำโครงงาน:** 
1. นางสาวปรียนันท์ ชานุ  6409680045  preyanan.cha@dome.tu.ac.th
2. นายสรรพวิชช์ ช่องดารากุล 6409610786  sappawit.cho@dome.tu.ac.th 
   
# ชุดโปรแกรมที่ต้องติดตั้งเพิ่มเติม
**1.pgAdmin:** ให้คุณติ้กโหลดแพคเกจ postgreSQL ไปด้วยเลยจะได้ไม่ต้องลงแยก<br>
&emsp;**กำหนดชื่อ Database ดังนี้: policy tracker** <br>

&emsp;**campaigns** <br>
&emsp;**expenses** <br>
&emsp;**parties** <br>
&emsp;**policies** <br>

&emsp;**เพิ่ม column Total Budget: Sum of [campaigns] allocated_budget** <br>


&emsp;**สร้าง index** <br>
      
      CREATE INDEX idx_policies_party_id ON public.policies(party_id);
      
      CREATE INDEX idx_campaigns_policy_id ON public.campaigns(policy_id); CREATE INDEX idx_campaigns_party_id ON    public.campaigns(party_id);
      
      CREATE INDEX idx_expenses_campaign_id ON public.expenses(campaign_id);

**2.Neo4j:** 

      CREATE CONSTRAINT campaign_id_unique IF NOT EXISTS
      FOR (c:Campaign) REQUIRE c.id IS UNIQUE;
      
      CREATE CONSTRAINT specialcampaign_id_unique IF NOT EXISTS
      FOR (sc:SpecialCampaign) REQUIRE sc.id IS UNIQUE;
      
      CREATE CONSTRAINT category_id_unique IF NOT EXISTS
      FOR (cat:Category) REQUIRE cat.id IS UNIQUE;
      
      CREATE CONSTRAINT event_id_unique IF NOT EXISTS
      FOR (e:Event) REQUIRE e.id IS UNIQUE;
      
      CREATE CONSTRAINT fingerprint_id_unique IF NOT EXISTS
      FOR (f:Fingerprint) REQUIRE f.id IS UNIQUE;
      
      CREATE CONSTRAINT likeLog_id_unique IF NOT EXISTS
      FOR (l:LikeLog) REQUIRE l.id IS UNIQUE;
      
      CREATE CONSTRAINT party_id_unique IF NOT EXISTS
      FOR (p:Party) REQUIRE p.id IS UNIQUE;
      
      CREATE CONSTRAINT policy_id_unique IF NOT EXISTS
      FOR (p:Policy) REQUIRE p.id IS UNIQUE;
      
      CREATE CONSTRAINT province_id_unique IF NOT EXISTS
      FOR (pr:Province) REQUIRE pr.id IS UNIQUE;
      
      CREATE CONSTRAINT region_id_unique IF NOT EXISTS
      FOR (r:Region) REQUIRE r.id IS UNIQUE;

**3.Git:** 

**4.Node.js:** 

**5.แอพพลิเคชั่นในการเขียนโค้ด (แนะนำ VS code):** ต้องติดตั้งคำสั่ง npm install ใน terminal ภายใต้ path ของโครงการ

      npm install

# โครงสร้างโฟลเดอร์ย่อย

**PolicyTracker** <br>
&emsp;**public** <br>

   &emsp;&emsp;**banner** <br>
   &emsp;&emsp;**bg** <br>
   &emsp;&emsp;**member** <br> 
   &emsp;&emsp;**ref** <br>
     
&emsp;**src** <br>

   &emsp;&emsp;**app** <br>
   &emsp;&emsp;**components/ui** <br>
   &emsp;&emsp;**lib** <br> 
   &emsp;&emsp;**types** <br>

# วิธีการใช้งานแอพพลิเคชั่น
