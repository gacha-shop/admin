-- menu 테이블에 "메뉴 관리" 메뉴 추가
-- 위치: 어드민(메뉴) > 메뉴 관리

-- Step 1: "어드민" 부모 메뉴의 ID 조회 및 저장
DO $$
DECLARE
  admin_menu_id uuid;
  menu_management_exists boolean;
BEGIN
  -- "어드민" 메뉴 찾기 (code가 'admin'인 메뉴)
  SELECT id INTO admin_menu_id
  FROM menus
  WHERE code = 'admin'
  LIMIT 1;

  -- "어드민" 메뉴가 없으면 에러 발생
  IF admin_menu_id IS NULL THEN
    RAISE EXCEPTION '"어드민" 메뉴를 찾을 수 없습니다. code="admin"인 메뉴가 존재하는지 확인하세요.';
  END IF;

  -- "메뉴 관리" 메뉴가 이미 존재하는지 확인
  SELECT EXISTS(
    SELECT 1 FROM menus WHERE code = 'admin-menu-management'
  ) INTO menu_management_exists;

  -- 이미 존재하면 종료
  IF menu_management_exists THEN
    RAISE NOTICE '"메뉴 관리" 메뉴가 이미 존재합니다. 추가를 건너뜁니다.';
    RETURN;
  END IF;

  -- "메뉴 관리" 메뉴 추가
  INSERT INTO menus (
    code,
    name,
    description,
    parent_id,
    path,
    icon,
    display_order,
    is_active,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    'admin-menu-management',           -- code
    '메뉴 관리',                        -- name
    '시스템 메뉴를 추가, 수정, 삭제할 수 있습니다.',  -- description
    admin_menu_id,                     -- parent_id (어드민 메뉴의 ID)
    '/admin/menus',                    -- path
    'Menu',                            -- icon (Lucide icon name)
    30,                                -- display_order (어드민 하위 메뉴 중 순서)
    true,                              -- is_active
    '{}'::jsonb,                       -- metadata
    now(),                             -- created_at
    now()                              -- updated_at
  );

  RAISE NOTICE '"메뉴 관리" 메뉴가 성공적으로 추가되었습니다.';
END $$;

-- 추가된 메뉴 확인
SELECT
  m.id,
  m.code,
  m.name,
  m.path,
  p.name as parent_name,
  m.display_order,
  m.is_active
FROM menus m
LEFT JOIN menus p ON m.parent_id = p.id
WHERE m.code = 'admin-menu-management';
