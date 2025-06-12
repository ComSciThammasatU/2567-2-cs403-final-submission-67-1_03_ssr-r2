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

**1.PostgreSQL:**<br> 

เข้าไปที่หน้า https://www.postgresql.org/download/ แล้วเลือกระบบปฏิบัติการ เมื่อไปหน้าถัดไปให้กดเลือก Download the installer เลือก system type ไฟล์จะเริ่มดาวน์โหลด <br>

กดเข้าไปที่ installer → เลือก path app → เลือกสิ่งที่ต้องการดาวน์โหลดเพิ่มเติมโดยมันจะติ้กทุกอย่างให้อยู่แล้ว → next → ตั้ง password → Next → Next → Next → Next → Install → finish <br>
เมื่ออยู่หน้า stack builder กดเลือก postgres port 5432 → Next → กดเลือก Categories → กด Add-ons → เลือก pgAgent , pgBouncer → กด Database Drivers → เลือก Npgsql , pglDBC , psql(system type) → กด Special Extension → เลือก PostGIS → กด Webdevelopment → เลือก PEM → Next → เลือก Download directory → Next → Next → Next → เลือก Install directory → Next → Next → Finish → Next → Next → ใส่ password → Next → กรอก username และ password → Next → OK → Finish → เลือกภาษา → 

**1.pgAdmin 4: (ในกรณีที่คุณยังไม่ได้ติดตั้ง)** <br>

เข้าไปที่หน้า https://www.pgadmin.org/download/ แล้วเลือกระบบปฏิบัติการ เมื่อไปหน้าถัดไปให้กดเลือกเวอร์ชันล่าสุด เลือก system type ไฟล์จะเริ่มดาวน์โหลด <br>

กดไปที่ไฟล์ → Install for me only → Next → Accept agreement → Next → เลือกที่ตั้งไฟล์ → Next → Next → Install → Finish <br>

กดเข้าแอพ pgAdmin4 → กดเลือก server → ใส่รหัส → กด server → register → server → ใส่ชื่อ name: PolicyTracker → กดแท็บ Connection → Host name: localhost → ใส่ password → save password <br>
กดเข้า server: PolicyTracker → คลิ๊กขวา create → Database → database name: policytracker → save<br>
กด database: policytracker → กด schema → คลิ๊กขวา public → Query Tool → ใส่คำสั่งตามนี้เพื่อสร้างตารางต่างๆ

&emsp;**เมื่อวางโคตรสร้างในแต่ละตารางแล้วให้กดรันแล้วจึงใส่โค้ดสร้างตารางใหม่** <br>
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

ไปที่หน้า repositories ที่ต้องการ clone จากนั้นกด <code> แล้วคัดลอกลิ้งก์ของ git
เปิด Command Prompt เมื่ออยู่ใน directory ที่ต้องการ (ถ้าไม่ให้ cd pathที่ต้องการ ก่อน)แล้วให้พิมพ์

      git clone ลิ้งก์ที่ก็อปมา

**4.แอพพลิเคชั่นในการเขียนโค้ด (แนะนำ VS code):**  <br>

กด open folder เลือกโฟลเดอร์ที่โคลนไว้ (ชื่อ PolicyTracker)<br>
กด ที่ตัวโปรเจ็ค (ตำแหน่งไฟล์จะอยู่ที่ root) → New file → ตั้งชื่อว่า .env.local → เขียนโค้ดดังนี้

      ### 🔗 Neo4j
      NEO4J_URI=bolt://localhost:7687
      NEO4J_USER=your username (default: neo4j)  ← ชื่อผู้ใช้ที่คุณตั้ง
      NEO4J_PASSWORD=your password ← รหัสผ่านที่คุณตั้ง
      
      ### 🐘 PostgreSQL (ถ้ามีใช้)
      POSTGRES_USER=your username (default: postgres)  ← ชื่อผู้ใช้ที่คุณตั้ง
      POSTGRES_PASSWORD=your password ← รหัสผ่านที่คุณตั้ง
      POSTGRES_DB=policy_tracker
      POSTGRES_HOST=localhost
      POSTGRES_PORT=5432
      
      
      ### 🔥 Firebase
      NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCaFgsyBvv7xYOfsQM-wf7P7kx7JJ9OubA
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=policy-tracker-kp.firebaseapp.com
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=policy-tracker-kp
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=policy-tracker-kp.firebasestorage.app
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1042626131048
      NEXT_PUBLIC_FIREBASE_APP_ID=1:1042626131048:web:7579b84a38245311ecb7dd
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-C9V0W9VKKZ
      
      ### Backend Firebase
      FIREBASE_PROJECT_ID=policy-tracker-kp
      FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@policy-tracker-kp.iam.gserviceaccount.com
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDauQiGEG1zT8po\ngEXYmo4xs2KwjD1p/tmTIq3t5pgtJ2SqmdfFlU8qliEMOairbzS0ugPjhEzXA4bq\nDuKgdq4wESGur3gD/UtTXSF8wkdsdJkbihYdbM6emagUjTSW+qV+Fwe5DK5ZsFXA\n1++QRMhU2JlCht/Ir86RHFvgAuN+/0FgGo6jspBhGAWTmy9uurDshGikutqYnHLJ\nctSEHRJ6zDe1pSHW/JUpsAptu3BnCbbTZTwmS/xlNJ7/2gkzk7z42UVCwwkbCHNq\n+DYDFRL+UwkG4XiegLTc+r2KqBdATIXe7JjmpY/e6kch5KwEtnoLfgURH9XQHirk\noR98wLcRAgMBAAECggEADniPh88ubqKo0aEq/dm77q3fqa6doZWq74Er4MGQ7+vb\nTS5AiGIIitjD9vsZnb4Nzqc/+p2WN+OT2YiClftEKwn3IIebeSgZA7r1rDtuXk6Y\nkqngLLI2OWgRJsrw38xVhrIfYK7mGikAg3HF99WVK4fpG+2wgKahFBi8O2X1h0Fc\n0NROMLzaf8Nw1wi8NpAB155xF15Nqn9MbZ3+vovS12bGeJzG71kiyJLgZRLxfyYh\nOmI4kxjk6S17Ci5/oj2OjtSeC7CEuI1i8L1SKL5mSIVrLKw7tVXdgOmBTkBTyL1k\niPXJgqCNRanYnHXYWa+uCn+5QVIFvPx37QFH3wLhwQKBgQDw8/Z+DaTE1YZs7K6C\nREksspM9iUCCXiJE68DII5H1iegQjCNsRy7vXW9ByVDMK6UM/nIPSmWN6ovpMU/A\n1jqHXBE67Plek0KJ/c/RWu5cCZmhhvhCTaWcM+KuC6lwpWqRAn26MmmHqiD5oNKm\nkzrmSa1t3srkdnDd1KmRtYQDXwKBgQDoYa78c2T77AtropSh3xg5JhZwqxmxc1Xf\npGaw80jn2abgWX31FP6kwJVFz6xhCdI4cY7eI5tU2e1rq/g6JrmEO0uH9JLaLASG\nWU4CDiPwK8SFmt5TgeJ8ZKpZqlopYD6xanc51perQ3r/q6u3EKeE/IPaNH/62vax\nlJ54CLpLjwKBgQDbpalHk2xmOjeGR+N0wIbsBgWPDPUPYnxe04Izb6l4aTRxES6h\nX+p7LXNkRv4ugIK+65xSMAGPcwYDl34aTa+hAN58FtXjzt3TKNovAHNU1zODOaRJ\n3LphQDMdcWgOVdxlQB4YhCgLEZ1psZ8VVhVVJEjCZVwTE50jut6xAwTKhQKBgEys\nrogtqwxUfhAtvM0MR3nTz2OtkPS0EYmRPTD1lQCrGBy+aokLPFowERDPzRjXnL1y\n+qjhJseAgI4eV/EYBe5TgkCBulKyY2vQ26Rh9gmw508OIn17Rbe1n1+mjclJMGZp\nsp0q6TBhO5xQkH/+xsdiaj79Q50J0owVdZQ1jQKRAoGBALqLADAJbJxBj12JJDn2\nL1KIX55dgLqVDYlGVi1Hpw0r57RM3SXXqz1/6/z1yX7+yGLYlrGtP797x2xxO5au\nHtS72I1JtuNhgfcIMjbQ0EsZZQ/l+TH3Em+PaES1GC00UMYmP1/AJh7F3WuRkXPe\nFwIwtTLRIrOi+4m+fHc4KtDc\n-----END PRIVATE KEY-----\n"
      
      NEXT_PUBLIC_BASE_URL=http://localhost:3000
      
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCaFgsyBvv7xYOfsQM-wf7P7kx7JJ9OubA
      REDIS_URL=rediss://default:AZQpAAIjcDExZjlmODBkNTQ2YWM0NjUxOTFjNzVlMjk1OWZhYWUzY3AxMA@valued-roughy-37929.upstash.io:6379

**5.Node.js:** <br>

กด new terminal เช็คว่าอยู่ภายใต้ path ของโครงการไหมจากนั้นรันโค้ดตามนี้

      npm install
# โครงสร้างโฟลเดอร์ย่อย (Directory Tree)

**PolicyTracker** <br>

เนื่องจากไฟล์มีจำนวนมากจึงจะแสดงแค่โฟลเดอร์ โดย CRUD ย่อมาจากชุดคำสั่งพื้นฐานในการจัดการข้อมูล (โดยเฉพาะกับฐานข้อมูล) ได้แก่:

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

เปิด pgAdmin 4 แล้วกด start ที่ database ของโปรเจค<br>
จากนั้นเปิด VS code แล้ว open folder ของโปรเจค จากนั้นกด new terminal แล้วพิมพ์โค้ดลงใน terminal

      npm run dev

กด allow Node.js เลือกไปที่ http://localhost:3000 ก้จะเข้าสู่หน้าเว็บของโปรเจค

**การใช้งานหน้า Admin (โดยจะต้องสร้างพรรคนั้นๆในระบบก่อนจึงจะกำหนด PR ในพรรคนั้นๆได้)**
กดเข้าไปที่หน้าเข้าสู่ระบบ จะพบกับหน้าต่อไปนี้<br>
![image](https://github.com/user-attachments/assets/d90f350d-34af-4f85-b543-c83ac0c5fefd)
โดยสิ่งที่ทำได้คือจัดการบัญชีผู้ใช้งานและบัญชีพรรคการเมือง<br>

&emsp;**1.จัดการบัญชีพรรคการเมือง**<br>
&emsp;&emsp;กดเลือก + เพื่อเพิ่มพรรคใหม่ กดแก้ไขเพื่อแก้ไขข้อมูลพรรคนั้นๆ และกดลบเพื่อลบพรรค

&emsp;**2.จัดการบัญชีผู้ใช้งาน**<br>
&emsp;&emsp;กดเลือก + เพื่อเพิ่มบัญชีผู้ใช้งาน กดแก้ไขเพื่อแก้ไขข้อมูลบัญชีผู้ใช้งานนั้นๆ และกดลบเพื่อลบบัญชีผู้ใช้งาน

**การใช้งานหน้า PR**

**คลิกปุ่ม "➕ เพิ่มนโยบาย"** ที่ด้านบนของหน้า รายการนโยบาย <br />
จะเข้าสู่แบบฟอร์ม <strong>ฟอร์มสำหรับกรอกข้อมูลนโยบาย</strong> ที่คุณสามารถกรอกข้อมูลตัวอย่างต่อไปนี้:

   <li><strong>ชื่อนโยบาย:</strong> เช่น "ส่งเสริมการท่องเที่ยวในจังหวัดชายแดนใต้"</li>
   <li><strong>หมวดหมู่:</strong> เลือกจาก dropdown เช่น "เศรษฐกิจ", "สังคม"</li>
   <li><strong>รายละเอียด:</strong> อธิบายวัตถุประสงค์และแผนดำเนินงาน</li>
   <li><strong>สถานะ:</strong> ระบุความคืบหน้าของนโยบาย เช่น เริ่มนโยบาย → วางแผน → ...</li>
   <li><strong>แนบรูปภาพ/แบนเนอร์:</strong> อัปโหลดภาพประกอบ เช่น แผนที่หรือโปสเตอร์</li>
   <li><strong>อัปโหลด PDF:</strong> สำหรับเอกสารอ้างอิง</li>
   <li><strong>เพิ่ม Timeline:</strong> ระบุเหตุการณ์ เช่น "เริ่มประชุมคณะทำงาน 5 มิ.ย. 2568"</li>

**✏ แก้ไขนโยบาย:**
** ที่หน้า <code>รายการนโยบาย</code> คลิกปุ่ม "✏ แก้ไข" ใต้การ์ดนโยบายที่ต้องการ<br />
คุณจะกลับเข้าสู่ฟอร์มโดยมีข้อมูลเดิมกรอกไว้แล้ว ซึ่งสามารถปรับแก้และกดบันทึกใหม่ได้**
