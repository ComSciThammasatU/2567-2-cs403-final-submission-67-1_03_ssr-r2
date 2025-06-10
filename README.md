[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/w8H8oomW)

**<ins>Note</ins>: Students must update this `README.md` file to be an installation manual or a README file for their own CS403 projects.**

**รหัสโครงงาน:** 67-1_03_ssr-r2

**ชื่อโครงงาน (ไทย): เว็ปไซต์ติดตามนโยบาย กิจกิกรรม และการเงิน ของพรรคการเมือง** 

**Project Title (Eng): Policy Tracking Website for monitoring the policies, activities, and finances of political parties. **


**อาจารย์ที่ปรึกษาโครงงาน:** ผศ. ดร. ทรงศักดิ์ รองวิริยะพาณิชย์

**ผู้จัดทำโครงงาน:** <br>
1. นางสาวปรียนันท์ ชานุ  6409680045  preyanan.cha@dome.tu.ac.th
2. นายสรรพวิชช์ ช่องดารากุล 6409610786  sappawit.cho@dome.tu.ac.th 
   
# ชุดโปรแกรมที่ต้องติดตั้งเพิ่มเติม
**1.pgAdmin:** ให้คุณติ้กโหลดแพคเกจ postgreSQL ไปด้วยเลยจะได้ไม่ต้องลงแยก<br>

&emsp;**กำหนดชื่อ Database ดังนี้: policy tracker** <br>

&emsp;**ตาราง campaigns** <br>

      CREATE TABLE IF NOT EXISTS public.campaigns (
          id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          name             TEXT,
          policy_id        INTEGER,
          allocated_budget BIGINT,
          created_at       TIMESTAMP WITHOUT TIME ZONE,
          area             TEXT,
          impact           TEXT,
          size             TEXT,
          party_id         INTEGER NOT NULL
      );

&emsp;**ตาราง expenses** <br>

      CREATE TABLE IF NOT EXISTS public.expenses (
          id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          campaign_id  INTEGER,
          description  TEXT,
          amount       INTEGER,
          created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
      );

&emsp;**ตาราง parties** <br>

      CREATE TABLE IF NOT EXISTS public.parties (
          id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          name TEXT
      );

&emsp;**ตาราง policies** <br>

      CREATE TABLE IF NOT EXISTS public.policies (
          id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          name         TEXT,
          total_budget BIGINT,
          party_id     INTEGER,
          created_at   TIMESTAMP WITHOUT TIME ZONE
      );

&emsp;**เพิ่ม column Total Budget: Sum of [campaigns] allocated_budget** <br>

      UPDATE public.policies
      SET total_budget = COALESCE(
        (SELECT SUM(allocated_budget)
         FROM public.campaigns
         WHERE policy_id = policies.id), 0
      );
      
      
      CREATE OR REPLACE FUNCTION public.update_policy_total_budget()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          UPDATE public.policies
          SET total_budget = COALESCE(
            (SELECT SUM(allocated_budget)
             FROM public.campaigns
             WHERE policy_id = NEW.policy_id), 0
          )
          WHERE id = NEW.policy_id;
      
          IF TG_OP = 'UPDATE' AND OLD.policy_id IS DISTINCT FROM NEW.policy_id THEN
            UPDATE public.policies
            SET total_budget = COALESCE(
              (SELECT SUM(allocated_budget)
               FROM public.campaigns
               WHERE policy_id = OLD.policy_id), 0
            )
            WHERE id = OLD.policy_id;
          END IF;
      
        ELSIF TG_OP = 'DELETE' THEN
        
          UPDATE public.policies
          SET total_budget = COALESCE(
            (SELECT SUM(allocated_budget)
             FROM public.campaigns
             WHERE policy_id = OLD.policy_id), 0
          )
          WHERE id = OLD.policy_id;
        END IF;
      
        RETURN NULL; END;
      $$ LANGUAGE plpgsql;
      
      CREATE TRIGGER trg_update_policy_budget
      AFTER INSERT OR UPDATE OF policy_id, allocated_budget OR DELETE
      ON public.campaigns
      FOR EACH ROW
      EXECUTE FUNCTION public.update_policy_total_budget(

&emsp;**สร้าง index** <br>
      
      CREATE INDEX idx_policies_party_id ON public.policies(party_id);
      
      CREATE INDEX idx_campaigns_policy_id ON public.campaigns(policy_id); CREATE INDEX idx_campaigns_party_id ON public.campaigns(party_id);
      
      CREATE INDEX idx_expenses_campaign_id ON public.expenses(campaign_id);

**2.Neo4j:** <br>
&emsp;**สร้าง index** <br>

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

**3.Git:** <br>
เข้าไปที่ https://git-scm.com/download/win <br>

ดาวน์โหลดไฟล์ “Git-*-64-bit.exe”<br>

รันไฟล์ ตอบ Next ไปเรื่อยๆ (ตั้งค่า default ได้เลย)<br>

เปิด Git Bash ตรวจสอบด้วยคำสั่ง ถ้าชึ้นเลขเวอร์ชันแปลว่าใช้งานได้<br>

     git --version

**4.Node.js:** 

**5.แอพพลิเคชั่นในการเขียนโค้ด (แนะนำ VS code):** ต้องติดตั้งคำสั่ง npm install ใน terminal ภายใต้ path ของโครงการ

      npm install

# โครงสร้างโฟลเดอร์ย่อย

**PolicyTracker** <br>

      PolicyTracker/
      ├─ public/
      │  ├─ banner/
      │  ├─ bg/
      │  ├─ member/
      │  └─ ref/
      └─ src/
         ├─ app/
         │  ├─ about/
         │  ├─ admin/
         │  │  ├─ party/
         │  │  │  ├─ create/
         │  │  │  └─ edit/
         │  │  │     └─ [id]/
         │  │  ├─ signup/
         │  │  └─ userlist/
         │  ├─ api/
         │  │  ├─ admin/
         │  │  │  ├─ getAllParties/
         │  │  │  ├─ party/
         │  │  │  │  └─ [id]/
         │  │  │  └─ users/
         │  │  │     └─ [uid]/
         │  │  ├─ banner/
         │  │  ├─ budget-summary/
         │  │  ├─ campaign/
         │  │  ├─ campaignbanner/
         │  │  │  └─ [id]/
         │  │  ├─ campaigndetail/
         │  │  │  └─ [id]/
         │  │  ├─ campaignlike/
         │  │  ├─ campaignsExpenses/
         │  │  ├─ clear-likelog/
         │  │  ├─ dashboard/
         │  │  │  └─ parties/
         │  │  ├─ event/
         │  │  │  ├─ province/
         │  │  │  │  └─ [province]/
         │  │  │  │     └─ region/
         │  │  │  │        └─ [region]/
         │  │  │  └─ region/
         │  │  │     └─ [region]/
         │  │  ├─ eventdetail/
         │  │  │  └─ [id]/
         │  │  ├─ expenses/
         │  │  ├─ home/
         │  │  │  ├─ progress/
         │  │  │  └─ summary/
         │  │  ├─ parties/
         │  │  ├─ party/
         │  │  │  └─ [id]/
         │  │  ├─ policy/
         │  │  ├─ policybanner/
         │  │  │  └─ [id]/
         │  │  ├─ policycategory/
         │  │  │  └─ [name]/
         │  │  ├─ policydetail/
         │  │  │  └─ [id]/
         │  │  ├─ policylike/
         │  │  ├─ policyProgress/
         │  │  ├─ policystatus/
         │  │  │  └─ [status]/
         │  │  ├─ pr-campaign/
         │  │  │  └─ [id]/
         │  │  ├─ pr-event/
         │  │  │  └─ [id]/
         │  │  ├─ pr-partyinfo/
         │  │  │  └─ [id]/
         │  │  ├─ pr-policy/
         │  │  │  └─ [id]/
         │  │  ├─ prCampaignForm/
         │  │  ├─ prEventForm/
         │  │  ├─ prPolicyForm/
         │  │  └─ scrape-member/
         │  ├─ components/
         │  │  └─ ui/
         │  ├─ lib/
         │  └─ types/
         ├─ components/
         │  └─ ui/
         ├─ lib/
         └─ types/

# วิธีการใช้งานแอพพลิเคชั่น
