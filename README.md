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

**1.PostgreSQL:**<br> →

เข้าไปที่หน้า https://www.postgresql.org/download/ แล้วเลือกระบบปฏิบัติการ เมื่อไปหน้าถัดไปให้กดเลือก Download the installer เลือก system type ไฟล์จะเริ่มดาวน์โหลด <br>
กดเข้าไปที่ installer → เลือก path app → เลือกสิ่งที่ต้องการดาวน์โหลดเพิ่มเติมโดยมันจะติ้กทุกอย่างให้อยู่แล้ว → next → ตั้ง password → Next → Next → Next → Next → Install → finish <br>
เมื่ออยู่หน้า stack builder กดเลือก postgres port 5432 → Next → กดเลือก Categories → กด Add-ons → เลือก pgAgent , pgBouncer → กด Database Drivers → เลือก Npgsql , pglDBC , psql(system type) → กด Special Extension → เลือก PostGIS → กด Webdevelopment → เลือก PEM → Next → เลือก Download directory → Next → Next → Next → เลือก Install directory → Next → Next → Finish → Next → Next → ใส่ password → Next → กรอก username และ password → Next → OK → Finish → เลือกภาษา → 

**1.pgAdmin 4: (ในกรณีที่คุณยังไม่ได้ติดตั้ง)** <br>

เข้าไปที่หน้า https://www.pgadmin.org/download/ แล้วเลือกระบบปฏิบัติการ เมื่อไปหน้าถัดไปให้กดเลือกเวอร์ชันล่าสุด เลือก system type ไฟล์จะเริ่มดาวน์โหลด <br>


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

เข้าไปที่เว็ป https://neo4j.com/download/ แล้วกด Download สำหรับ Desktop เมื่อไปที่หน้าต่อไปให้กรอกข้อมูลส่วนตัวให้เรียบร้อยจากนั้นกด Download Desktop ไฟล์จะเริ่มดาวน์โหลด<br>

กดเข้าไปในไฟล์ set up → only for me → next → เลือกตำแหน่งไฟลฺ์ → Install → Finish<br>

เมื่อเปิดแอพพลิเคชั่น ให้อ่านและกด agree ยอมรับเงื่อนไข → allow public and private networks → เลือกที่จัดเก็บข้อมูลของแอพ → เมื่อเจอหน้ากรอกข้อมูลให้กด skip → กดย่อ cmd ที่เด้งขึ้นมาในขั้น preparing application<br>
ในแถบซ้ายมือ กด + New → create project <br>
ในแถบขวามือ กด + Add → ใส่ชื่อ database ว่า: PolicyTracker → ตั้งรหัสผ่าน → create → start → open<br>

จากนั้นใส่คำสั่งดังนี้ในช่องด้านบนสุดของแถบขวา

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

# โครงสร้างโฟลเดอร์ย่อย (Directory Tree)

**PolicyTracker** <br>

โดย CRUD ย่อมาจากชุดคำสั่งพื้นฐานในการจัดการข้อมูล (โดยเฉพาะกับฐานข้อมูล) ได้แก่:

C – Create
สร้างข้อมูลใหม่ (เพิ่มเรคอร์ดใหม่ในตาราง)

R – Read
อ่านหรือดึงข้อมูล (ค้นหา/แสดงข้อมูลที่มีอยู่)

U – Update
แก้ไขหรือปรับปรุงข้อมูลเดิม

D – Delete
ลบข้อมูลออกจากระบบ
      
      PolicyTracker/                 ← โฟลเดอร์รากของโปรเจกต์
      ├─ public/                     ← โฟลเดอร์เก็บไฟล์สาธารณะ
      │  ├─ banner/                  ← รูป banner ของนโยบาย/แคมเปญ
      │  ├─ bg/                      ← รูปพื้นหลัง
      │  ├─ member/                  ← รูปสมาชิกพรรค
      │  └─ ref/                     ← ไฟล์อ้างอิง (เอกสาร, PDF)
      └─ src/                        ← โค้ดซอร์สหลักของแอป
         ├─ app/                     ← โฟลเดอร์ Next.js “app” structure
         │  ├─ about/                ← หน้า “เกี่ยวกับเรา”
         │  ├─ admin/                ← หน้าและ API สำหรับ admin
         │  │  ├─ party/             ← จัดการข้อมูลพรรค
         │  │  │  ├─ create/         ← ฟอร์มสร้างพรรคใหม่
         │  │  │  └─ edit/           ← ฟอร์มแก้ไขข้อมูลพรรค
         │  │  │     └─ [id]/         ← พารามิเตอร์ ID พรรครายบุคคล
         │  │  ├─ signup/            ← ฟอร์มสมัครผู้ใช้ใหม่
         │  │  └─ userlist/          ← หน้าแสดงรายชื่อผู้ใช้
         │  ├─ api/                  ← โฟลเดอร์เก็บ API routes
         │  │  ├─ admin/             ← API สำหรับ admin
         │  │  │  ├─ getAllParties/  ← ดึงรายชื่อพรรคทั้งหมด
         │  │  │  ├─ party/          ← จัดการ CRUD พรรค
         │  │  │  │  └─ [id]/         ← API พรรคราย ID
         │  │  │  └─ users/          ← จัดการข้อมูลผู้ใช้
         │  │  │     └─ [uid]/        ← API ผู้ใช้ตาม UID
         │  │  ├─ banner/            ← API อัปโหลด/ลบ banner
         │  │  ├─ budget-summary/    ← สรุปงบประมาณแต่ละพรรค
         │  │  ├─ campaign/          ← CRUD แคมเปญ
         │  │  ├─ campaignbanner/    ← อัปโหลดรูปแคมเปญ
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID แคมเปญ
         │  │  ├─ campaigndetail/    ← ดึงรายละเอียดแคมเปญ
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID แคมเปญ
         │  │  ├─ campaignlike/      ← จัดการระบบไลก์แคมเปญ
         │  │  ├─ campaignsExpenses/ ← จัดการค่าใช้จ่ายแคมเปญ
         │  │  ├─ clear-likelog/     ← รีเซ็ตประวัติไลก์
         │  │  ├─ dashboard/         ← API ข้อมูลแดชบอร์ด
         │  │  │  └─ parties/        ← แดชบอร์ดแยกตามพรรค
         │  │  ├─ event/             ← CRUD กิจกรรม
         │  │  │  ├─ province/       ← กรองตามจังหวัด
         │  │  │  │  └─ [province]/   ← พารามิเตอร์รหัสจังหวัด
         │  │  │  │     └─ region/    ← จัดกลุ่มตามภาค
         │  │  │  │        └─ [region]/ ← พารามิเตอร์รหัสภาค
         │  │  │  └─ region/         ← กรองตามภาค
         │  │  │     └─ [region]/     ← พารามิเตอร์รหัสภาค
         │  │  ├─ eventdetail/       ← ดึงรายละเอียดกิจกรรม
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID กิจกรรม
         │  │  ├─ expenses/          ← API จัดการค่าใช้จ่ายทั่วไป
         │  │  ├─ home/              ← API ข้อมูลหน้าแรก
         │  │  │  ├─ progress/       ← ความคืบหน้าโครงการ
         │  │  │  └─ summary/        ← สรุปภาพรวม
         │  │  ├─ parties/           ← API ดึงข้อมูลพรรค
         │  │  ├─ party/             ← API ดึงข้อมูลพรรคตาม ID
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID พรรค
         │  │  ├─ policy/            ← CRUD นโยบาย
         │  │  ├─ policybanner/      ← อัปโหลดรูปนโยบาย
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID นโยบาย
         │  │  ├─ policycategory/    ← ดึงนโยบายตามหมวดหมู่
         │  │  │  └─ [name]/         ← พารามิเตอร์ชื่อหมวดหมู่
         │  │  ├─ policydetail/      ← ดึงรายละเอียดนโยบาย
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID นโยบาย
         │  │  ├─ policylike/        ← จัดการระบบไลก์นโยบาย
         │  │  ├─ policyProgress/    ← API คำนวณความคืบหน้านโยบาย
         │  │  ├─ policystatus/      ← ดึงสถานะนโยบายต่างๆ
         │  │  │  └─ [status]/       ← พารามิเตอร์สถานะ
         │  │  ├─ pr-campaign/       ← หน้าและ API สำหรับ PR แก้ไขแคมเปญ
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID แคมเปญ
         │  │  ├─ pr-event/          ← หน้าและ API สำหรับ PR จัดการกิจกรรม
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID กิจกรรม
         │  │  ├─ pr-partyinfo/      ← หน้าและ API สำหรับ PR จัดการข้อมูลพรรค
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID พรรค
         │  │  ├─ pr-policy/         ← หน้าและ API สำหรับ PR จัดการนโยบาย
         │  │  │  └─ [id]/           ← พารามิเตอร์ ID นโยบาย
         │  │  ├─ prCampaignForm/    ← คอมโพเนนต์ฟอร์มสร้าง/แก้ไขแคมเปญสำหรับ PR
         │  │  ├─ prEventForm/       ← คอมโพเนนต์ฟอร์มสร้าง/แก้ไขกิจกรรมสำหรับ PR
         │  │  ├─ prPolicyForm/      ← คอมโพเนนต์ฟอร์มสร้าง/แก้ไขนโยบายสำหรับ PR
         │  │  └─ scrape-member/     ← สคริปต์ดึงข้อมูลสมาชิกพรรคจากเว็บภายนอก
         │  ├─ components/          ← คอมโพเนนต์ UI ทั่วไป
         │  │  └─ ui/               ← ไลบรารี UI ที่ใช้ร่วมกัน
         │  ├─ lib/                 ← ฟังก์ชันช่วยเหลือและเซอร์วิสต่างๆ
         │  └─ types/               ← คำอธิบาย TypeScript types
         ├─ components/             ← คอมโพเนนต์ UI นอก src/app
         │  └─ ui/                  ← ไลบรารี UI ที่ใช้ร่วมกัน
         ├─ lib/                    ← ฟังก์ชันช่วยเหลือและเซอร์วิส (นอก src)
         └─ types/                  ← คำอธิบาย TypeScript types (นอก src)

# วิธีการใช้งานแอพพลิเคชั่น



