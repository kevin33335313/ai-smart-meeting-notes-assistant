import os
import google.generativeai as genai

# �q�����ܼ�Ū�� API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

async def process_audio_with_gemini(audio_file_path: str) -> dict:
    """
    �ϥ� Gemini 2.5 Flash �����B�z���T�ɮסC
    """
    print(f"Uploading file to Gemini: {audio_file_path}")
    # 1. �W���ɮר� Gemini ���ɮתA��
    audio_file = genai.upload_file(path=audio_file_path)

    # �����ɮ׳B�z����
    while audio_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        audio_file = genai.get_file(audio_file.name)

    if audio_file.state.name == "FAILED":
        raise ValueError(audio_file.state.name)
        
    print(f"\nFile uploaded successfully. Starting analysis...")

    # 2. �ǳ� Prompt�A�]�t�ﭵ�T���ޥ�
    prompt = """
    �A�O�@��M�~���|ĳ�O���U�z�C�ХJ�Ӳ�ť�ä��R�o�q�|ĳ���T�C
    �ھڭ��T���e�A�H JSON �榡���ѥH�U��T�G
    1.  `summary`: �@�q���W�L 300 �r���|ĳ�K�n�C
    2.  `key_decisions`: �@�ӥ]�t�|ĳ���Ҧ�����M�����r��}�C�C
    3.  `action_items`: �@�Ӫ���}�C�A�C�Ӫ���]�t `task` (���ȴy�z), `owner` (�t�d�H), �M `due_date` (�I����)�C�p�G��T�����T�A�ж�g "N/A"�C
    4.  `mindmap_structure`: �@�ӥΩ�ͦ��ߴ��Ϫ��_�� JSON ����A�]�t `name` (���ߥD�D), `children` (�l�`�I�}�C)�C

    �Ъ�����X�ŦX�W�d�� JSON ����A���n�]�t�����B�~�������� Markdown �y�k�C
    """

    # 3. �إ߼ҫ��åͦ����e
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
    
    # �N���T�ɮשM��r prompt �@�_�o�e
    response = model.generate_content([audio_file, prompt])

    # 4. �M�z�ê�^ JSON ���G
    # (�ݭn�[�W���~�B�z�M JSON �ѪR���{���X)
    cleaned_json_string = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(cleaned_json_string)