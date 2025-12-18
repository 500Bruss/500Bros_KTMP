# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Hệ thống quản lý bảo hiểm toàn diện được xây dựng trên nền tảng Java Spring Boot và ReactJS. Hệ thống hỗ trợ toàn bộ quy trình từ cấu hình sản phẩm, báo giá linh hoạt (Quotation), thanh toán trực tuyến cho đến quản lý hợp đồng và bồi thường.

#### *🚀 Công nghệ sử dụng (Tech Stack)*

##### *Backend:*
- Java 17+ / Spring Boot 3.x: Framework chính xử lý logic nghiệp vụ.

- Spring Data JPA: Giao tiếp cơ sở dữ liệu.

- Spring Security & JWT: Xác thực và phân quyền (RBAC).

- MySQL: Cơ sở dữ liệu quan hệ, sử dụng kiểu dữ liệu JSON cho các trường linh hoạt.

##### *Frontend:*

- ReactJS: Thư viện UI xây dựng giao diện người dùng.

- Vite: Tooling build giúp tối ưu hóa hiệu suất phát triển.

##### *Infrastructure & DevOps:*

- Docker & Docker Compose: Đóng gói và quản lý container.
- Render: Nền tảng triển khai backend (System Deployment).
- TiDB: Nền tảng triển khai database (Database Deployment)
- Vercel: Nền tảng triên khai frontend (Layer Deployment)

##### *VNPAY PAYMENT API:* 
- Tích hợp cổng thanh toán trực tuyến.

##### * Tính năng chính*

-  *Quản lý sản phẩm linh hoạt:* Sử dụng cấu trúc JSON Metadata giúp dễ dàng cấu hình thêm các gói bảo hiểm mới (Nhân thọ, Sức khỏe, Xe cộ) mà không cần thay đổi cấu trúc Database.

-  *Luồng Báo giá (Quotation):* Tự động tính toán phí bảo hiểm dựa trên dữ liệu đầu vào của khách hàng và các quyền lợi bổ sung (Add-ons).

-  *Thanh toán trực tuyến:* Tích hợp cổng thanh toán VNPAY, xử lý giao dịch an toàn và cập nhật trạng thái đơn hàng thời gian thực.

-  *Quản lý Hợp đồng (Policy):* Theo dõi vòng đời hợp đồng, lưu trữ lịch sử thay đổi trạng thái và tự động xử lý khi hết hạn.

-  *Quy trình Bồi thường (Claims):* Cho phép người dùng gửi yêu cầu bồi thường trực tuyến và nhân viên bồi thường xử lý đơn.

-  *Bảo mật:* Phân quyền chi tiết (Admin/User), quản lý phiên đăng nhập với JWT & Refresh Token.


#####* Kiến trúc hệ thống (Architecture):**

Hệ thống được thiết kế theo mô hình Monolithic Architecture chuẩn, chia lớp (Layered Architecture) để đảm bảo tính dễ bảo trì:

- Controller Layer: Tiếp nhận yêu cầu REST API.

- Service Layer: Xử lý logic nghiệp vụ bảo hiểm và quy tắc tính phí.

- Repository Layer: Tương tác với MySQL.

- Security Layer: Lọc và kiểm soát truy cập.

#####* Hướng dẫn cài đặt**

Yêu cầu hệ thống:

- JDK 17+

- Node.js & npm

- MySQL 8.0+

- Docker & Docker Compose

Chạy Backend (Local)

1. Cấu hình Database trong file src/main/resources/application.yml

2. Chạy ứng dụng: ./mvnw spring-boot:run

3. Đóng gói cho Deploy: mvn clean package -DskipTests

Chạy Frontend

1. Di chuyển vào thư mục frontend:
npm install -> 
npm run dev

Triển khai với Docker: docker compose up --build -d