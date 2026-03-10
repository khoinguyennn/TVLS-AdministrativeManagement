# Facilities Management Translations

## Thêm vào file `src/client/src/messages/en.json`:

```json
{
  "Facilities": {
    "buildings": {
      "title": "Building Management",
      "description": "Manage information about buildings in the school",
      "addBuilding": "Add Building",
      "editBuilding": "Edit Building",
      "deleteBuilding": "Delete Building",
      "searchPlaceholder": "Search by building name...",
      "columns": {
        "no": "No.",
        "name": "Building Name",
        "description": "Description",
        "actions": "Actions"
      },
      "form": {
        "name": "Building Name",
        "namePlaceholder": "E.g., Building A",
        "description": "Description",
        "descriptionPlaceholder": "Enter description (optional)",
        "cancel": "Cancel",
        "create": "Create",
        "update": "Update"
      },
      "deleteConfirm": {
        "title": "Confirm Delete",
        "description": "Are you sure you want to delete building \"{name}\"? This action cannot be undone.",
        "confirm": "Delete",
        "cancel": "Cancel"
      },
      "toast": {
        "createSuccess": "Building created successfully!",
        "updateSuccess": "Building updated successfully!",
        "deleteSuccess": "Building deleted successfully!",
        "error": "An error occurred, please try again."
      },
      "pagination": {
        "showing": "Showing",
        "to": "to",
        "of": "of",
        "buildings": "buildings"
      },
      "noResults": "No buildings found.",
      "loading": "Loading..."
    },
    "rooms": {
      "title": "Room Management",
      "description": "Manage information about rooms in buildings",
      "addRoom": "Add Room",
      "editRoom": "Edit Room",
      "deleteRoom": "Delete Room",
      "searchPlaceholder": "Search by room name...",
      "allBuildings": "All buildings",
      "columns": {
        "no": "No.",
        "name": "Room Name",
        "building": "Building",
        "actions": "Actions"
      },
      "form": {
        "building": "Building",
        "selectBuilding": "Select building",
        "name": "Room Name",
        "namePlaceholder": "E.g., Room 101",
        "cancel": "Cancel",
        "create": "Create",
        "update": "Update"
      },
      "deleteConfirm": {
        "title": "Confirm Delete",
        "description": "Are you sure you want to delete room \"{name}\"? This action cannot be undone.",
        "confirm": "Delete",
        "cancel": "Cancel"
      },
      "toast": {
        "createSuccess": "Room created successfully!",
        "updateSuccess": "Room updated successfully!",
        "deleteSuccess": "Room deleted successfully!",
        "error": "An error occurred, please try again."
      },
      "pagination": {
        "showing": "Showing",
        "to": "to",
        "of": "of",
        "rooms": "rooms"
      },
      "noResults": "No rooms found.",
      "loading": "Loading..."
    },
    "devices": {
      "title": "Device Management",
      "description": "Manage information about devices in rooms",
      "addDevice": "Add Device",
      "editDevice": "Edit Device",
      "deleteDevice": "Delete Device",
      "searchPlaceholder": "Search by device name...",
      "allRooms": "All rooms",
      "allStatuses": "All statuses",
      "columns": {
        "no": "No.",
        "name": "Device Name",
        "room": "Room",
        "building": "Building",
        "status": "Status",
        "actions": "Actions"
      },
      "statuses": {
        "active": "Active",
        "under_repair": "Under Repair",
        "waiting_replacement": "Waiting Replacement",
        "broken": "Broken"
      },
      "form": {
        "name": "Device Name",
        "namePlaceholder": "E.g., Epson Projector",
        "room": "Room",
        "selectRoom": "Select room (optional)",
        "noRoom": "No room selected",
        "status": "Status",
        "cancel": "Cancel",
        "create": "Create",
        "update": "Update"
      },
      "deleteConfirm": {
        "title": "Confirm Delete",
        "description": "Are you sure you want to delete device \"{name}\"? This action cannot be undone.",
        "confirm": "Delete",
        "cancel": "Cancel"
      },
      "toast": {
        "createSuccess": "Device created successfully!",
        "updateSuccess": "Device updated successfully!",
        "deleteSuccess": "Device deleted successfully!",
        "error": "An error occurred, please try again."
      },
      "pagination": {
        "showing": "Showing",
        "to": "to",
        "of": "of",
        "devices": "devices"
      },
      "noResults": "No devices found.",
      "notAssigned": "Not assigned",
      "loading": "Loading..."
    }
  }
}
```

## Thêm vào file `src/client/src/messages/vi.json`:

```json
{
  "Facilities": {
    "buildings": {
      "title": "Quản lý Toà nhà",
      "description": "Quản lý thông tin các toà nhà trong trường",
      "addBuilding": "Thêm toà nhà",
      "editBuilding": "Chỉnh sửa toà nhà",
      "deleteBuilding": "Xoá toà nhà",
      "searchPlaceholder": "Tìm kiếm theo tên toà nhà...",
      "columns": {
        "no": "STT",
        "name": "Tên toà nhà",
        "description": "Mô tả",
        "actions": "Hành động"
      },
      "form": {
        "name": "Tên toà nhà",
        "namePlaceholder": "Ví dụ: Toà nhà A",
        "description": "Mô tả",
        "descriptionPlaceholder": "Nhập mô tả (tùy chọn)",
        "cancel": "Hủy",
        "create": "Tạo mới",
        "update": "Cập nhật"
      },
      "deleteConfirm": {
        "title": "Xác nhận xoá",
        "description": "Bạn có chắc chắn muốn xoá toà nhà \"{name}\"? Hành động này không thể hoàn tác.",
        "confirm": "Xoá",
        "cancel": "Hủy"
      },
      "toast": {
        "createSuccess": "Tạo toà nhà thành công!",
        "updateSuccess": "Cập nhật toà nhà thành công!",
        "deleteSuccess": "Xoá toà nhà thành công!",
        "error": "Có lỗi xảy ra, vui lòng thử lại."
      },
      "pagination": {
        "showing": "Hiển thị",
        "to": "đến",
        "of": "trong tổng số",
        "buildings": "toà nhà"
      },
      "noResults": "Không tìm thấy toà nhà nào.",
      "loading": "Đang tải..."
    },
    "rooms": {
      "title": "Quản lý Phòng",
      "description": "Quản lý thông tin các phòng trong toà nhà",
      "addRoom": "Thêm phòng",
      "editRoom": "Chỉnh sửa phòng",
      "deleteRoom": "Xoá phòng",
      "searchPlaceholder": "Tìm kiếm theo tên phòng...",
      "allBuildings": "Tất cả toà nhà",
      "columns": {
        "no": "STT",
        "name": "Tên phòng",
        "building": "Toà nhà",
        "actions": "Hành động"
      },
      "form": {
        "building": "Toà nhà",
        "selectBuilding": "Chọn toà nhà",
        "name": "Tên phòng",
        "namePlaceholder": "Ví dụ: Phòng 101",
        "cancel": "Hủy",
        "create": "Tạo mới",
        "update": "Cập nhật"
      },
      "deleteConfirm": {
        "title": "Xác nhận xoá",
        "description": "Bạn có chắc chắn muốn xoá phòng \"{name}\"? Hành động này không thể hoàn tác.",
        "confirm": "Xoá",
        "cancel": "Hủy"
      },
      "toast": {
        "createSuccess": "Tạo phòng thành công!",
        "updateSuccess": "Cập nhật phòng thành công!",
        "deleteSuccess": "Xoá phòng thành công!",
        "error": "Có lỗi xảy ra, vui lòng thử lại."
      },
      "pagination": {
        "showing": "Hiển thị",
        "to": "đến",
        "of": "trong tổng số",
        "rooms": "phòng"
      },
      "noResults": "Không tìm thấy phòng nào.",
      "loading": "Đang tải..."
    },
    "devices": {
      "title": "Quản lý Thiết bị",
      "description": "Quản lý thông tin các thiết bị trong phòng",
      "addDevice": "Thêm thiết bị",
      "editDevice": "Chỉnh sửa thiết bị",
      "deleteDevice": "Xoá thiết bị",
      "searchPlaceholder": "Tìm kiếm theo tên thiết bị...",
      "allRooms": "Tất cả phòng",
      "allStatuses": "Tất cả trạng thái",
      "columns": {
        "no": "STT",
        "name": "Tên thiết bị",
        "room": "Phòng",
        "building": "Toà nhà",
        "status": "Trạng thái",
        "actions": "Hành động"
      },
      "statuses": {
        "active": "Hoạt động",
        "under_repair": "Đang sửa chữa",
        "waiting_replacement": "Chờ thay thế",
        "broken": "Hỏng"
      },
      "form": {
        "name": "Tên thiết bị",
        "namePlaceholder": "Ví dụ: Máy chiếu Epson",
        "room": "Phòng",
        "selectRoom": "Chọn phòng (tùy chọn)",
        "noRoom": "Không chọn phòng",
        "status": "Trạng thái",
        "cancel": "Hủy",
        "create": "Tạo mới",
        "update": "Cập nhật"
      },
      "deleteConfirm": {
        "title": "Xác nhận xoá",
        "description": "Bạn có chắc chắn muốn xoá thiết bị \"{name}\"? Hành động này không thể hoàn tác.",
        "confirm": "Xoá",
        "cancel": "Hủy"
      },
      "toast": {
        "createSuccess": "Tạo thiết bị thành công!",
        "updateSuccess": "Cập nhật thiết bị thành công!",
        "deleteSuccess": "Xoá thiết bị thành công!",
        "error": "Có lỗi xảy ra, vui lòng thử lại."
      },
      "pagination": {
        "showing": "Hiển thị",
        "to": "đến",
        "of": "trong tổng số",
        "devices": "thiết bị"
      },
      "noResults": "Không tìm thấy thiết bị nào.",
      "notAssigned": "Chưa gán",
      "loading": "Đang tải..."
    }
  }
}
```

## Hướng dẫn sử dụng:

1. Copy nội dung JSON ở trên
2. Thêm vào cuối file `src/client/src/messages/en.json` (trước dấu `}` cuối cùng)
3. Thêm vào cuối file `src/client/src/messages/vi.json` (trước dấu `}` cuối cùng)
4. Nhớ thêm dấu phẩy `,` sau object trước đó

## Cách sử dụng trong component:

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('Facilities.buildings');

// Sử dụng:
t('title') // "Building Management" hoặc "Quản lý Toà nhà"
t('form.name') // "Building Name" hoặc "Tên toà nhà"
```
